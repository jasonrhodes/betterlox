import { backoff } from "../../lib/backoff";
import { tmdb } from "../../lib/tmdb";
import { Person } from "../entities";
import { getDataSource } from "../orm";

function denullify(value: string | undefined | null) {
  return value === null ? undefined : value;
}

export const getPeopleRepository = async () => (await getDataSource()).getRepository(Person).extend({
  async syncPeople(ids: number[]) {
    return Promise.all(
      ids.map(async (id) => {
        const tmdbPerson = await backoff(() => tmdb.personInfo(id), 5);
        const created = this.create({
          name: tmdbPerson.name,
          biography: tmdbPerson.biography,
          birthday: denullify(tmdbPerson.birthday),
          deathday: denullify(tmdbPerson.deathday),
          gender: tmdbPerson.gender,
          imdbId: tmdbPerson.imdb_id,
          knownForDepartment: tmdbPerson.known_for_department,
          placeOfBirth: denullify(tmdbPerson.place_of_birth),
          popularity: tmdbPerson.popularity,
          profilePath: denullify(tmdbPerson.profile_path)
        });
        return this.save(created);
      })
    );
  }
});