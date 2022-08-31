import { FilmEntry } from "../entities/FilmEntry";
import { getDataSource } from "../orm";

export const getFilmEntriesRepository = async () => (await getDataSource()).getRepository(FilmEntry).extend({
  async getFilmEntriesWithMissingMovies(limit?: number) {
    const query = this.createQueryBuilder("filmEntry")
      .leftJoinAndSelect("filmEntry.movie", "movie")
      .select("filmEntry.movieId", "movieId")
      .addSelect("filmEntry.userId", "userId")
      .addSelect("filmEntry.letterboxdSlug", "letterboxdSlug")
      .distinctOn(["filmEntry.movieId", "filmEntry.letterboxdSlug"])
      .where("movie.title IS NULL")
      .andWhere("filmEntry.movieId != :zero", { zero: 0 })
      .andWhere("filmEntry.unsyncable = :unsyncable", { unsyncable: false })
      .orderBy("filmEntry.movieId", "ASC")
      .addOrderBy("filmEntry.letterboxdSlug", "ASC")
      .addOrderBy("filmEntry.date", "DESC")
      .limit(limit);
  
    const result = await query.getRawMany<{ movieId: number; userId: number; letterboxdSlug: string | undefined }>();
    return result;
  }
});