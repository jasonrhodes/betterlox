import e from "express";
import { MoviesApiResponse } from "../../../common/types/api";
import { getMoviesRepository } from "../../../db/repositories";
import { convertYearsToRange } from "../../../lib/convertYearsToRange";
import { numberListQueryParam, numericQueryParam, singleQueryParam, stringListQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";


const SORT_BY_MAP = {
  popularity: 'movie.popularity',
  dateRated: 'date',
  title: 'movie.title'
};

const MoviesApiRoute = createApiRoute<MoviesApiResponse>({
  handlers: {
    get: async (req, res) => {
      const MoviesRepo = await getMoviesRepository();
      const ids = numberListQueryParam(req.query.ids);
      const genres = stringListQueryParam(req.query.genres);
      const excludedGenres = stringListQueryParam(req.query.excludedGenres);
      const dateRange = convertYearsToRange(singleQueryParam(req.query.releaseDateRange));
      const collections = numberListQueryParam(req.query.collections);
      const userId = numericQueryParam(req.query.blindspotsForUser);
      const limit = numericQueryParam(req.query.limit);
      const sortBy = (singleQueryParam(req.query.sortBy) || 'popularity') as 'popularity' | 'dateRated' | 'title';
      const sortDir = (singleQueryParam(req.query.sortDir) || 'DESC') as 'ASC' | 'DESC';
      const mappedSortBy = SORT_BY_MAP[sortBy];


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

        if (collections.length > 0) {
          query = query.leftJoin('movie.collections', 'collection')
            .andWhere(`collection.id IN(${collections.join(',')})`);
        }

        if (dateRange.length === 2 && typeof dateRange[0] === "string" && typeof dateRange[1] === "string") {
          query = query.andWhere('movie.releaseDate BETWEEN :start AND :end', {
            start: dateRange[0],
            end: dateRange[1]
          });
        }
      }

      query = query.orderBy(mappedSortBy, sortDir).limit(limit);

      const results = await query.getMany();
      res.json({ success: true, movies: results });
    }
  }
});

export default MoviesApiRoute;