import { Collection } from "../entities";
import { getDataSource } from "../orm";

interface TmdbCollection {
  id: number;
  name: string;
  poster_path?: string;
  backdrop_path?: string;
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
  }
});