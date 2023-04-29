import e from "express";
import { MoviesApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { getMoviesRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { convertYearsToRange } from "@rhodesjason/loxdb/dist/lib/convertYearsToRange";
import { numberListQueryParam, numericQueryParam, singleQueryParam, stringListQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../lib/routes";


const SORT_BY_MAP = {
  popularity: 'score.averageRating',
  dateRated: 'date',
  title: 'movie.title'
};

const MoviesApiRoute = createApiRoute<any>({
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

      const subquery = MoviesRepo.createQueryBuilder('movie')
        .leftJoin('movie.entries', 'entry')
        .select('movie.id')
        .addSelect('AVG(entry.stars)', 'averageRating')
        .groupBy('movie.id');

      query = query.leftJoin(() => `(${subquery.getQuery()})`, 'score', 'movie.id = score.id')
        .addSelect('score.averageRating');

      query = query.orderBy(mappedSortBy, sortDir).limit(limit);

      let results = await query.getRawMany();

      // let averages: any[] = [];
      // if (sortBy === 'popularity') {
      //   const rQuery = MoviesRepo.createQueryBuilder('movie')
      //     .leftJoin('movie.entries', 'entry')
      //     .select('movie.id')
      //     .addSelect('AVG(entry.stars)', 'averageRating')
      //     .where(`movie.id IN(${results.map(m => m.id).join(',')})`)
      //     .groupBy('movie.id')
      //     .having('COUNT(entry."userId") > 1');
        
      //   averages = await rQuery.getRawMany();
      //   results = results.map((m) => {
      //     const avg = averages.find(a => a.id === m.id);
      //     m.loxAverageRating = avg.averageRating || 0;
      //     return m;
      //   })
      // }
      res.json({ success: true, movies: results });
    }
  }
});

export default MoviesApiRoute;