import { SelectQueryBuilder } from "typeorm";
import { getCastRepository, getCrewRepository } from ".";
import { CREW_JOB_MAP } from "../../common/constants";
import { PeopleStatsType, PersonStats, StatMode } from "../../common/types/api";
import { backoff } from "../../lib/backoff";
import { tmdb, TmdbPerson } from "../../lib/tmdb";
import { Person } from "../entities";
import { getDataSource } from "../orm";

function forceUndefined(value: string | undefined | null) {
  return (!value || value.length === 0) ? undefined : value;
}

function isValidDate(value: string | null | undefined) {
  if (!value || value.length === 0) {
    return false;
  }
  const d = new Date(value);
  return d.toString() !== 'Invalid Date';
}

function safeDate(dateValue: string | undefined | null) {
  return isValidDate(dateValue) ? dateValue as string : undefined;
}

function applyOrderBy(orderBy: StatMode, query: SelectQueryBuilder<Person>) {
  if (orderBy === "favorite") {
    return query.orderBy("AVG(rating.stars)", "DESC");
  } else if (orderBy === "most") {
    return query
      .orderBy('COUNT(movie.id)', "DESC")
      .addOrderBy("AVG(rating.stars)", "DESC");
  } else {
    return query;
  }
}

export const getPeopleRepository = async () => (await getDataSource()).getRepository(Person).extend({
  async syncPeople(ids: number[]) {
    return Promise.all(
      ids.map(async (id) => {
        const tmdbPerson = await backoff<Promise<TmdbPerson | null>>(
          async () => tmdb.personInfo(id), 
          5, 
          `Problem while retrieving ${id} from TMDB person info API`
        );
        if (!tmdbPerson) {
          console.log(`Person not found in TMDB (ID: ${id})`);
          const CastRepo = await getCastRepository();
          const CrewRepo = await getCrewRepository();
          const castRoles = await CastRepo.find({ where: { personId: id }});
          const crewRoles = await CrewRepo.find({ where: { personId: id }});
          castRoles.forEach((role => {
            role.personUnsyncable = true;
            CastRepo.save(role);
          }));
          crewRoles.forEach((role => {
            role.personUnsyncable = true;
            CrewRepo.save(role);
          }))
          return null;
        }
        const created = this.create({
          id: tmdbPerson.id,
          name: tmdbPerson.name,
          biography: tmdbPerson.biography,
          birthday: safeDate(tmdbPerson.birthday),
          // deathday: safeDate(tmdbPerson.deathday), // undefined value here still causing error: invalid input syntax for type timestamp: \"0NaN-NaN-NaNTNaN:NaN:NaN.NaN+NaN:NaN\" -- not storing deathday for now, who cares
          gender: tmdbPerson.gender,
          imdbId: tmdbPerson.imdb_id,
          knownForDepartment: tmdbPerson.known_for_department,
          placeOfBirth: forceUndefined(tmdbPerson.place_of_birth),
          popularity: tmdbPerson.popularity,
          profilePath: forceUndefined(tmdbPerson.profile_path)
        });
        return this.save(created);
      })
    );
  },
  async getStats({ type, userId, orderBy }: { type: PeopleStatsType; userId: number; orderBy: StatMode }) {
    if (type === "actors") {
      const query = this.createQueryBuilder('person')
        .innerJoin("person.castRoles", "castRole")
        .innerJoin("castRole.movie", "movie")
        .innerJoin((sub) => {
          return sub.select(["stars", `"rating"."movieId"`])
            .from("ratings", "rating")
            .distinctOn(["rating.movieId"])
            .where("rating.userId = :userId", { userId })
            .orderBy("rating.movieId", "ASC")
            .addOrderBy("rating.date", "DESC");
        }, "rating", `"rating"."movieId" = movie.id`)
        .addSelect('AVG(rating.stars) as average_rating')
        .addSelect('COUNT(movie.id) as count_rated')
        .where('castRole.castOrder <= :maxCastOrder', { maxCastOrder: 10 }) // TODO: Make this configurable
        .groupBy("person.id")
        .having("COUNT(movie.id) >= :minSeen", { minSeen: 3 })
        .limit(150); // TODO: Configurable?
      
      const orderedQuery = applyOrderBy(orderBy, query);
      // console.log(orderedQuery.getSql()); // REMOVE
 
      return mapPersonStats(await orderedQuery.getRawMany<RawPersonStatResult>());

    } else if (Object.keys(CREW_JOB_MAP).includes(type)) {
      const jobs = CREW_JOB_MAP[type].map(j => `'${j}'`).join(',');
      const query = this.createQueryBuilder('person')
        .innerJoin("person.crewRoles", "crewRole")
        .innerJoin("crewRole.movie", "movie")
        .innerJoin((sub) => {
          return sub.select(["stars", `"rating"."movieId"`])
            .from("ratings", "rating")
            .distinctOn(["rating.movieId"])
            .where("rating.userId = :userId", { userId })
            .orderBy("rating.movieId", "ASC")
            .addOrderBy("rating.date", "DESC");
        }, "rating", `"rating"."movieId" = movie.id`)
        .addSelect('AVG(rating.stars) as average_rating')
        .addSelect('COUNT(movie.id) as count_rated')
        .where(`crewRole.job IN (${jobs})`)
        .groupBy("person.id")
        .having("COUNT(movie.id) >= :minSeen", { minSeen: 3 })
        .limit(150); // TODO: Configurable?
      
      const orderedQuery = applyOrderBy(orderBy, query);
      // console.log(orderedQuery.getSql()); // REMOVE
      
      return mapPersonStats(await orderedQuery.getRawMany<RawPersonStatResult>());
    }
  }
});

interface RawPersonResult {
  person_biography: Person['biography'];
  person_birthday: Person['birthday'];
  person_deathday: Person['deathday'];
  person_gender: Person['gender'];
  person_id: Person['id'];
  person_imdbId: Person['imdbId'];
  person_knownForDepartment: Person['knownForDepartment'];
  person_name: Person['name'];
  person_placeOfBirth: Person['placeOfBirth'];
  person_popularity: Person['popularity'];
  person_profilePath: Person['profilePath'];
}

interface RawPersonStatResult extends RawPersonResult {
  average_rating: number;
  count_rated: number;
}

function mapPersonStats(stats: RawPersonStatResult[]): PersonStats[] {
  return stats.map((raw) => ({
    biography: raw.person_biography,
    birthday: raw.person_birthday,
    deathday: raw.person_deathday,
    gender: raw.person_gender,
    id: raw.person_id,
    imdbId: raw.person_imdbId,
    knownForDepartment: raw.person_knownForDepartment,
    name: raw.person_name,
    placeOfBirth: raw.person_placeOfBirth,
    popularity: raw.person_popularity,
    profilePath: raw.person_profilePath,
    averageRating: raw.average_rating,
    countRated: Number(raw.count_rated),
    castRoles: [],
    crewRoles: []
  }));
}