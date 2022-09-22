import { In, TypeORMError } from "typeorm";
import { BlindspotMovie, BlindspotsSortBy, UserBlindspotExtras, UserBlindspotsApiResponse } from "../../../../common/types/api";
import { getDataSource } from "../../../../db/orm";
import { getCollectionsRepository } from "../../../../db/repositories";
import { convertYearsToRange } from "../../../../lib/convertYearsToRange";
import { getErrorAsString } from "../../../../lib/getErrorAsString";
import { numberListQueryParam, numericQueryParam, singleQueryParam, stringListQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";


const SORT_BY_MAP = {
  loxScore: '"loxScore"',
  loxMostRated: 'score."countRatings"',
  loxHighestRated: 'score."averageRating"',
  releaseDate: 'm."releaseDate"',
  title: 'm.title'
};

const UserRoute = createApiRoute<UserBlindspotsApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!;
      const movieIds = numberListQueryParam(req.query.movieIds);
      const genres = stringListQueryParam(req.query.genres).map(g => g.toLowerCase());
      const excludedGenres = stringListQueryParam(req.query.excludedGenres).map(g => g.toLowerCase());
      const dateRange = singleQueryParam(req.query.releaseDateRange);
      const collections = numberListQueryParam(req.query.collections);
      const limit = numericQueryParam(req.query.limit);
      const sortBy = (singleQueryParam(req.query.sortBy) || 'loxScore') as BlindspotsSortBy;
      const sortDir = (singleQueryParam(req.query.sortDir) || 'DESC').toUpperCase() as 'ASC' | 'DESC';
      const minRatings = sortBy === "loxHighestRated" ? numericQueryParam(req.query.minRatings, 5) : 0;
      const mappedSortBy = SORT_BY_MAP[sortBy];

      if (!mappedSortBy) {
        const message = `Invalid sortBy parameter provided: ${sortBy}`;
        console.log(message);
        return res.status(400).json({ success: false, code: 400, message });
      }

      if (!['ASC', 'DESC'].includes(sortDir)) {
        const message = `Invalid sortDir paramter provided: ${sortDir}`;
        console.log(message);
        return res.status(400).json({ success: false, code: 400, message });
      }

      try {
        validateParameters({
          genres,
          excludedGenres,
          dateRange,
          collections
        });
      } catch (error: unknown) {
        const message = getErrorAsString(error);
        console.log(message);
        res.status(400).json({ success: false, code: 400, message });
        return;
      }

      const DS = await getDataSource();
      let unknownIds: number[] = [];
      const extras: UserBlindspotExtras = {};

      if (movieIds.length > 0) {
        try {
          const foundMovies = await DS.query(`
            SELECT id FROM movies
            WHERE id IN (${movieIds.join(',')})
          `) as { id: number; }[];
          if (foundMovies.length < movieIds.length) {
            const foundIds = foundMovies.map(f => f.id);
            unknownIds = movieIds.filter(id => !foundIds.includes(id));
          }
        } catch (error: unknown) {
          console.log('Error while checking movie IDs', getErrorAsString(error));
          // ignore error and continue
        }
      }
      
      const query: string[] = [
        `SELECT m.id,
          m."posterPath", 
          m.runtime, 
          m."releaseDate", 
          m.title, 
          m.status, 
          m.popularity, 
          m."imdbId", 
          m."letterboxdSlug", 
          m.genres,
          score."averageRating",
          score."countRatings",
          score."averageRating" * score."countRatings" as "loxScore"
        `
      ];
      
      query.push('FROM movies m');
      query.push(`LEFT JOIN (
                    SELECT m.id, AVG(e.stars) AS "averageRating", COUNT(e."userId")::int AS "countRatings"
                    FROM movies m
                    LEFT JOIN film_entries e ON e."movieId" = m.id
                    WHERE e.stars IS NOT NULL
                    GROUP BY m.id
                    HAVING COUNT(e."userId") >= ${minRatings}
                ) score ON score.id = m.id`);
      
      if (collections.length > 0) {
        query.push(`LEFT JOIN collections_movies_movies collection ON collection."moviesId" = m.id`);
      }

      query.push('WHERE score."averageRating" IS NOT NULL');
      query.push(`AND m.id NOT IN (
                    SELECT "movieId"
                    FROM film_entries
                    WHERE "userId" = ${userId}
                )`);
      
      if (movieIds.length > 0) {
        query.push(`AND m.id IN (${movieIds.join(',')})`);
      }

      if (genres.length > 0) {
        // postgres array contains @> https://www.postgresql.org/docs/9.1/functions-array.html
        // case-insensitive array compare: https://stackoverflow.com/questions/40911205/case-insensitive-postgres-query-with-array-contains
        query.push(`AND LOWER(m.genres::text)::text[] @> '{${genres.join(',')}}'`);
      }

      if (excludedGenres.length > 0) {
        // postgres array overlap && https://www.postgresql.org/docs/9.1/functions-array.html
        // case-insensitive array compare: https://stackoverflow.com/questions/40911205/case-insensitive-postgres-query-with-array-contains
        query.push(`AND NOT(LOWER(m.genres::text)::text[] && '{${excludedGenres.join(',')}}')`);
      }

      // TODO: I should treat collections like cast/crew and use TMDB as the source
      if (collections.length > 0) {
        query.push(`AND collection."collectionsId" IN(${collections.join(',')})`);

        try {
          const CollectionsRepo = await getCollectionsRepository();
          extras.collections = await CollectionsRepo.findBy({ id: In(collections) });
        } catch (error) {
          console.log('Error querying for collection info', getErrorAsString(error));
          // log and ignore this error
        }
      }

      const [start, end] = convertYearsToRange(dateRange);
      if (typeof start === "string" && typeof end === "string") {
        query.push(`AND m."releaseDate" BETWEEN '${start}' AND '${end}'`);
      }

      query.push(`ORDER BY ${mappedSortBy} ${sortDir}`);
      if (typeof limit === "number") {
        query.push(`LIMIT ${limit}`);
      }

      try {
        const response = await DS.query(query.join('\n')) as BlindspotMovie[];
        return res.json({ success: true, blindspots: response, extras, unknownIds })
      } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
          message = `Error while fetching blindspots data: ${error.message}`;
        } else {
          const errorMessage = getErrorAsString(error);
          message = `Unknown error while fetching blindspots data: ${errorMessage}`;
        }
        console.log(message);
        return res.status(500).json({ success: false, code: 500, message });
      }

    },
  }
});

interface ParametersToValidate {
  genres: string[];
  excludedGenres: string[];
  dateRange: string | undefined;
  collections: number[];
}

function validateParameters({
  genres,
  excludedGenres,
  dateRange,
  collections
}: ParametersToValidate) {
  console.log('Validating parameters', JSON.stringify({ genres, excludedGenres, dateRange, collections }));
  const genreRegExp = new RegExp('^[a-zA-Z\-_\w]*$');
  const yearRegExp = new RegExp('^[1-3]{1}[0-9]{3}$');
  const decadeRegExp = new RegExp('^Decade: ?[1-3]{1}[0-9]{3}s$');

  if (dateRange) {
    console.log('valid year', dateRange, `${dateRange.length} characters`, typeof dateRange, yearRegExp.test(dateRange));
    console.log('valid decade', dateRange, decadeRegExp.test(dateRange));
  }

  if (genres.length > 0 && genres.some(g => !genreRegExp.test(g))) {
    throw new Error('Invalid value(s) for parameter "genres" provided');
  }
  if (excludedGenres.length > 0 && excludedGenres.some(g => !genreRegExp.test(g))) {
    throw new Error('Invalid value(s) for parameter "excludedGenres" provided');
  }
  if (typeof dateRange === "string" && !yearRegExp.test(dateRange) && !decadeRegExp.test(dateRange)) {
    throw new Error(`Invalid value for parameter "releaseDateRange" provided (${dateRange} - please provide YYYY or Decade:YYYYs)`)
  }
  if (collections.length > 0 && collections.some(c => isNaN(c) || typeof c !== "number")) {
    throw new Error('Invalid value(s) for parameter "collections" provided (must be a comma-separated list of numbers only)')
  }
}

export default UserRoute;