import { TmdbGenre } from "../../lib/tmdb";
import { Genre } from "../entities";
import { getDataSource } from "../orm";

export const getGenresRepository = async () => (await getDataSource()).getRepository(Genre).extend({
  createFromTmdb(genre: TmdbGenre) {
    const created = this.create({
      id: genre.id,
      name: genre.name
    });
    return this.save(created);
  }
});