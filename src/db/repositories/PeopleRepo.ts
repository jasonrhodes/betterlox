import axios from "axios";
import { getCastRepository, getCrewRepository } from ".";
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
  }
});