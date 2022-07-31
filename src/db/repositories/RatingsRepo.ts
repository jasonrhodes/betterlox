import { Rating } from "../entities/Rating";
import { getDataSource } from "../orm";

export const getRatingsRepository = async () => (await getDataSource()).getRepository(Rating).extend({
  async getRatingsWithMissingMovies(limit?: number) {
    const query = this.createQueryBuilder("rating")
      .leftJoinAndSelect("rating.movie", "movie")
      .select("rating.movieId", "movieId")
      .addSelect("rating.userId", "userId")
      .addSelect("rating.letterboxdSlug", "letterboxdSlug")
      .distinctOn(["rating.movieId", "rating.letterboxdSlug"])
      .where("movie.title IS NULL")
      .andWhere("rating.movieId != :zero", { zero: 0 })
      .andWhere("rating.unsyncable = :unsyncable", { unsyncable: false })
      .orderBy("rating.movieId", "ASC")
      .addOrderBy("rating.letterboxdSlug", "ASC")
      .addOrderBy("rating.date", "DESC")
      .limit(limit);
  
    const result = await query.getRawMany<{ movieId: number; userId: number; letterboxdSlug: string | null }>();
    return result;
  }
});