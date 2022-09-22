import { In, ILike, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { getCastRepository, getCrewRepository, getMoviesRepository } from ".";
import { CREW_JOB_MAP } from "../../common/constants";
import { PeopleStatsType, PersonStats, SearchApiResults, StatMode } from "../../common/types/api";
import { backoff } from "../../lib/backoff";
import { getErrorAsString } from "../../lib/getErrorAsString";
import { tmdb, TmdbPerson } from "../../lib/tmdb";
import { Person, UserSettings } from "../entities";
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
    return query
      .orderBy("ROUND(CAST(AVG(entry.stars) as NUMERIC), 1)", "DESC")
      .addOrderBy("COUNT(movie.id)", "DESC")
      .addOrderBy("person.name", "ASC");
  } else if (orderBy === "most") {
    return query
      .orderBy('COUNT(movie.id)', "DESC")
      .addOrderBy("ROUND(CAST(AVG(entry.stars) as NUMERIC), 1)", "DESC")
      .addOrderBy("person.name", "ASC");
  } else {
    return query;
  }
}

interface PeopleSearchOptions {
  limit?: number;
  ids?: string[];
  role?: string;
  namePattern?: string;
  exactName?: string;
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
  async getStats({ 
    type, 
    userId, 
    orderBy,
    minCastOrder,
    minWatched,
    dateRange,
    genres,
    excludedGenres,
    allGenres,
    onlyWomen,
    onlyNonBinary
  }: { 
    type: PeopleStatsType; 
    userId: number; 
    orderBy: StatMode;
    minCastOrder: UserSettings['statsMinCastOrder'];
    minWatched: UserSettings['statsMinWatched'];
    dateRange: string[];
    genres: string[];
    excludedGenres: string[];
    allGenres: boolean;
    onlyWomen: boolean;
    onlyNonBinary: boolean;
  }) {
    if (orderBy === "most") {
      minWatched = 0;
    }

    // console.log("Attempting stat look up for date range", dateRange.join(" - "));
    try {
      if (type === "actors") {
        let query = this.createQueryBuilder('person')
          .innerJoin("person.castRoles", "castRole")
          .innerJoin("castRole.movie", "movie");

        query = addEntriesJoin(query, { userId });
        query = selectAverageRating(query);
        query = selectCountRated(query);
        query = query.where('castRole.castOrder <= :maxCastOrder', { maxCastOrder: minCastOrder })
        query = andWhereRatingExists(query, { orderBy });
        query = andWhereGenderFilter(query, { onlyWomen, onlyNonBinary });
        query = andWhereMovieInDateRange(query, { dateRange });
        query = andWhereMovieInGenres(query, { genres, allGenres });
        query = andWhereMovieNotInGenres(query, { excludedGenres });
        query = query.groupBy("person.id");
        query = query.having("COUNT(movie.id) >= :minWatched", { minWatched });
        query = query.limit(150); // TODO: Configurable?
        query = applyOrderBy(orderBy, query);

        // console.log(query.getSql()); // REMOVE
        
        try {
          return mapPersonStats(await query.getRawMany<RawPersonStatResult>());
        } catch (error) {
          console.log('Error with actors query:', query.getSql());
          if (error instanceof Error) {
            error.message = `Caught actors SQL error, original message: ${error.message}`;
          }
          throw error;
        }

      } else if (Object.keys(CREW_JOB_MAP).includes(type)) {
        const jobs = CREW_JOB_MAP[type].map(j => `'${j}'`).join(',');
        let query = this.createQueryBuilder('person')
          .innerJoin("person.crewRoles", "crewRole")
          .innerJoin("crewRole.movie", "movie");
          // .innerJoin("movie.genres", "genre");
        
        query = addEntriesJoin(query, { userId });
        query = selectAverageRating(query);
        query = selectCountRated(query);
        query = query.where(`crewRole.job IN (${jobs})`);
        query = andWhereRatingExists(query, { orderBy });
        query = andWhereGenderFilter(query, { onlyWomen, onlyNonBinary });
        query = andWhereMovieInDateRange(query, { dateRange });
        query = andWhereMovieInGenres(query, { genres, allGenres });
        query = andWhereMovieNotInGenres(query, { excludedGenres });
        query = query.groupBy("person.id");
        query = query.having("COUNT(movie.id) >= :minWatched", { minWatched });
        query = query.limit(150); // TODO: Configurable?
        query = applyOrderBy(orderBy, query);

        // console.log(query.getSql()); // REMOVE
        
        return mapPersonStats(await query.getRawMany<RawPersonStatResult>());
      }
    } catch (error: unknown) {
      console.log("Query error", getErrorAsString(error));
      throw error;
    }
  },
  async searchForApi({
    limit,
    ids,
    role = "actors",
    namePattern,
    exactName
  }: PeopleSearchOptions) {

    let query = this.createQueryBuilder('p');
    
    if (ids) {
      query = query.andWhere(`p.id IN (${ids.join(',')})`);
    }

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    if (role === "actors") {
      query = query.innerJoin('join_movies_cast', 'cr', 'cr."personId" = p.id')
        .andWhere('cr IS NOT NULL')
        .andWhere('cr."castOrder" <= 10');
    } else if (role === "directors" || role === "writers") {
      const jobs = CREW_JOB_MAP[role];
      query = query.innerJoin('join_movies_crew', 'cr', 'cr."personId" = p.id')
        .andWhere('cr IS NOT NULL')
        .andWhere(`cr.job IN ('${jobs.join("','")}')`);
    }

    if (namePattern) {
      query = query.andWhere(`p.name ILIKE '%${namePattern.replace(' ', '%')}%'`);
    }
    
    if (exactName) {
      query = query.andWhere('p.name = :exactName', { exactName });
    }

    query = query.innerJoin('film_entries', 'e', 'e."movieId" = cr."movieId"')
      .addSelect('COUNT(e."movieId") as pop_score')
      .groupBy('p.id')
      .orderBy('pop_score', 'DESC');
    
    return await query.getMany();
  }
});

function addEntriesJoin(query: SelectQueryBuilder<Person>, { userId }: { userId: number }) {
  return query.innerJoin((sub) => {
    return sub.select(["stars", `"entry"."movieId"`])
      .from("film_entries", "entry")
      .distinctOn(["entry.movieId"])
      .where("entry.userId = :userId", { userId })
      .orderBy("entry.movieId", "ASC")
      .addOrderBy("entry.date", "DESC");
  }, "entry", `"entry"."movieId" = movie.id`)
}

function selectAverageRating(query: SelectQueryBuilder<Person>) {
  return query.addSelect('AVG(entry.stars) as average_rating');
}

function selectCountRated(query: SelectQueryBuilder<Person>) {
  return query.addSelect('COUNT(movie.id) as count_rated');
}

function andWhereRatingExists(query: SelectQueryBuilder<Person>, { orderBy }: { orderBy: StatMode }) {
  if (orderBy === 'favorite') {
    return query.andWhere('entry IS NOT NULL');
  }
  return query;
}

function andWhereMovieInDateRange(query: SelectQueryBuilder<Person>, { dateRange }: { dateRange: string[] }) {
  if (dateRange.length === 2) {
    return query.andWhere('movie.releaseDate BETWEEN :start AND :end', {
      start: dateRange[0],
      end: dateRange[1]
    });
  } else {
    return query;
  }
}

function andWhereGenderFilter(query: SelectQueryBuilder<Person>, { onlyWomen, onlyNonBinary }: { onlyWomen: boolean; onlyNonBinary: boolean; }) {
  if (!onlyWomen && !onlyNonBinary) {
    return query;
  }

  if (!onlyWomen && onlyNonBinary) {
    return query.andWhere('person.gender = 3');
  }

  if (onlyWomen && !onlyNonBinary) {
    return query.andWhere('person.gender = 1');
  }

  return query.andWhere('person.gender IN (1, 3)');
}

function andWhereMovieInGenres(query: SelectQueryBuilder<Person>, { 
  genres, 
  allGenres
}: { 
  genres: string[]; 
  allGenres?: boolean;
}) {
  if (genres.length === 0) {
    return query;
  }

  if (allGenres) {
    return query.andWhere(`movie.genres @> '{${genres.join(',')}}'`);
  } else {
    // Not implementing the "ANY" case for genres at this time
    return query;
  }
}

function andWhereMovieNotInGenres(query: SelectQueryBuilder<Person>, { excludedGenres }: { excludedGenres: string[] }) {
  if (excludedGenres.length === 0) {
    return query;
  }

  return query.andWhere(`NOT(movie.genres && '{${excludedGenres.join(',')}}')`);
}

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