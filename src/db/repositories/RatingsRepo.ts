import { Rating } from "../entities/Rating";
import { getDataSource } from "../orm";

export const getRatingsRepository = async () => (await getDataSource()).getRepository(Rating).extend({
  async getRatingsWithMissingMovies(limit?: number) {
    const query = this.createQueryBuilder("rating")
      .leftJoinAndSelect("rating.movie", "movie")
      .select("rating.movieId", "movieId")
      .distinctOn(["rating.movieId"])
      .where("movie.title IS NULL")
      .andWhere("rating.movieId != :zero", { zero: 0 })
      .orderBy("rating.movieId", "ASC")
      .addOrderBy("rating.date", "DESC")
      .limit(limit);
  
    const result = await query.getRawMany<{ movieId: number }>();
    return result.map(({ movieId }) => movieId);
  }
});