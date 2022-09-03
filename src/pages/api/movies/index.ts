import e from "express";
import { MoviesApiResponse } from "../../../common/types/api";
import { getMoviesRepository } from "../../../db/repositories";
import { convertYearsToRange } from "../../../lib/convertYearsToRange";
import { numberListQueryParam, numericQueryParam, singleQueryParam, stringListQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

const MoviesApiRoute = createApiRoute<MoviesApiResponse>({
  handlers: {
    get: async (req, res) => {
      const MoviesRepo = await getMoviesRepository();
      const ids = numberListQueryParam(req.query.ids);
      const genres = stringListQueryParam(req.query.genres);
      const excludedGenres = stringListQueryParam(req.query.excludedGenres);
      const dateRange = convertYearsToRange(singleQueryParam(req.query.releaseDateRange));
      const userId = numericQueryParam(req.query.blindspotsForUser);
      const limit = numericQueryParam(req.query.limit);

      // TODO: Accept collections? Other filters?
      let query = MoviesRepo.createQueryBuilder('movie');

      if (ids.length > 0) {
        query = query.where(`id IN (${ids.join(',')})`);

      } else {
        if (userId) {
          query = query.leftJoin('movie.entries', 'entry', 'movie.id = entry.movieId AND entry.userId = :userId', { userId })
            .where('entry.userId IS NULL');
        }

        if (genres.length > 0) {
          query = query.andWhere(`movie.genres @> '{${genres.join(',')}}'`);
        }

        if (excludedGenres.length > 0) {
          query = query.andWhere(`NOT(movie.genres && '{${excludedGenres.join(',')}}')`);
        }

        if (dateRange.length === 2) {
          query = query.andWhere('movie.releaseDate BETWEEN :start AND :end', {
            start: dateRange[0],
            end: dateRange[1]
          });
        }
      }

      query = query.orderBy('movie.popularity', 'DESC')
        .addOrderBy('movie.releaseDate', 'DESC')
        .limit(limit);

      const results = await query.getMany();
      res.json({ success: true, movies: results });
    }
  }
});

export default MoviesApiRoute;