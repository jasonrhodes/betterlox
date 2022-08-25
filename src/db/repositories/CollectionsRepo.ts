import { FindManyOptions, FindOptionsWhere, In, ILike } from "typeorm";
import { SearchCollection } from "../../common/types/api";
import { Collection } from "../entities";
import { getDataSource } from "../orm";

interface TmdbCollection {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
}

interface CollectionsSearchOptions {
  limit?: number;
  ids?: string[];
  namePattern?: string;
  exactName?: string;
}

export const getCollectionsRepository = async () => (await getDataSource()).getRepository(Collection).extend({
  async createFromTmdb(belongsToCollection: object) {
    if (belongsToCollection === null) {
      return [];
    }

    const c = belongsToCollection as TmdbCollection; // big assumption here

    // rudimentary runtime type-checking blech
    try {
      const keys = Object.keys(c);
      if (!keys.includes('id') || !keys.includes('name')) {
        throw new Error('id or name keys not present');
      }

      if (typeof c.id !== "number" || typeof c.name !== "string") {
        throw new Error('id or name keys not correct types');
      }

      const created = this.create({
        id: c.id,
        name: c.name,
        posterPath: c.poster_path,
        backdropPath: c.backdrop_path
      });
      const saved = await this.save(created);
      return [saved];
    } catch (error: unknown) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log('Error while checking type for belongsToCollection value', errorMessage, JSON.stringify(belongsToCollection));
      return [];
    }
  },
  async searchForApi({
    limit,
    ids,
    namePattern,
    exactName
  }: CollectionsSearchOptions) {
    const where: FindOptionsWhere<Collection> = {};

    if (ids) {
      where.id = In(ids);
    }

    if (namePattern) {
      where.name = ILike(`%${namePattern.replace(' ', '%')}%`);
    }

    if (exactName) {
      where.name = exactName;
    }

    const query = this.createQueryBuilder('collection')
      .select('collection.id', 'id')
      .addSelect('collection.name', 'name')
      .addSelect('COUNT(entry.movieId) as entryCount')
      .where(where)
      .leftJoin("collection.movies", "movie")
      .leftJoin("movie.entries", "entry")
      .groupBy('collection.id')
      .addGroupBy('collection.name')
      .having('COUNT(entry.movieId) > 0')
      .orderBy('entryCount', 'DESC')
      .take(limit ? Number(limit) : undefined);

    return query.getRawMany<SearchCollection>();
  }
});