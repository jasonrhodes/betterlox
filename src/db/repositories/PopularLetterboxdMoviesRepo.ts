import { PopularLetterboxdMovie } from "../entities";
import { getDataSource } from "../orm";

export const getPopularLetterboxdMoviesRepository = async () => (await getDataSource()).getRepository(PopularLetterboxdMovie).extend({
  async getPopularMoviesWithMissingMovies(limit?: number) {
    const query = this.createQueryBuilder("popular")
      .leftJoin("popular.movie", "movie")
      .leftJoin("unknown_items", "u", `popular.id = u."itemId" AND u.type = 'movie'`)
      .select("popular.id", "movieId")
      .addSelect("popular.letterboxdSlug", "letterboxdSlug")
      .distinctOn(["popular.id", "popular.letterboxdSlug"])
      .where("movie.title IS NULL")
      .andWhere("popular.id != :zero", { zero: 0 })
      .andWhere("popular.unsyncable = :unsyncable", { unsyncable: false })
      .andWhere("u.type IS NULL")
      .orderBy("popular.id", "ASC")
      .addOrderBy("popular.letterboxdSlug", "ASC")
      .limit(limit);
  
    const result = await query.getRawMany<{ movieId: number; letterboxdSlug: string | undefined }>();
    return result;
  }
})