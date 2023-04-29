import { getFilmEntriesRepository } from "@rhodesjason/loxdb/dist/db/repositories/FilmEntriesRepo";
import { numberListQueryParam, numericQueryParam, singleQueryParam, stringListQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { convertYearsToRange } from "@rhodesjason/loxdb/dist/lib/convertYearsToRange";
import { EntryMovie, EntryQueryResult, EntryApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { ObjectLiteral, QueryBuilder, SelectQueryBuilder } from "typeorm";
import { FilmEntry } from "@rhodesjason/loxdb/dist/db/entities";
import { CREW_JOB_MAP } from "@rhodesjason/loxdb/dist/common/constants";

function convertResultsToEntries(results: EntryQueryResult[]): EntryApiResponse[] {
  return results.map(result => ({
    letterboxdSlug: result.entry_letterboxdSlug,
    movieId: result.entry_movieId,
    name: result.entry_name,
    unsyncable: result.entry_unsyncable,
    userId: result.entry_userId,
    stars: result.entry_stars,
    date: result.entry_date,
    heart: result.entry_heart,
    rewatch: result.entry_rewatch,
    movie: convertResultToEntryMovie(result)
  }));
}

function convertResultToEntryMovie(result: EntryQueryResult): EntryMovie {
  return {
    id: result.movie_id,
    backdropPath: result.movie_backdropPath,
    imdbId: result.movie_imdbId,
    originalLanguage: result.movie_originalLanguage,
    originalTitle: result.movie_originalTitle,
    posterPath: result.movie_posterPath,
    popularity: result.movie_popularity,
    runtime: result.movie_runtime,
    releaseDate: result.movie_releaseDate,
    letterboxdSlug: result.movie_letterboxdSlug,
    title: result.movie_title,
    genres: result.movie_genres,
    tagline: result.movie_tagline
  }
}

interface JoinCrewOptions {
  query: SelectQueryBuilder<FilmEntry>;
  jobs: string[];
  joinName: string;
}

function joinCrew({ query, jobs, joinName }: JoinCrewOptions) {
  return query.innerJoin(
    (subquery) => (
      subquery
        .select('m.id', 'id')
        .addSelect('ARRAY_AGG(jmc.personId)', 'ids')
        .from('movies', 'm')
        .innerJoin('join_movies_crew', 'jmc', 'jmc.movieId = m.id')
        .where(`jmc.job IN('${jobs.join("','")}')`)
        .groupBy('m.id')
    ),
    joinName, 
    `${joinName}.id = entry.movieId`
  );
}

function whereCrew(joinName: string, ids: number[]) {
  return `${joinName}.ids @> ARRAY[${ids.join(',')}]`;
}

const UserEntriesRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      const releaseDateRange = convertYearsToRange(singleQueryParam(req.query.releaseDateRange));
      const genres = stringListQueryParam(req.query.genres);
      const excludedGenres = stringListQueryParam(req.query.excludedGenres);
      const collections = numberListQueryParam(req.query.collections);
      const userId = numericQueryParam(req.query.userId);
      const actors = numberListQueryParam(req.query.actors);
      const directors = numberListQueryParam(req.query.directors);
      const writers = numberListQueryParam(req.query.writers);
      const editors = numberListQueryParam(req.query.editors);
      const cinematographers = numberListQueryParam(req.query.cinematographers);

      const FilmEntriesRepo = await getFilmEntriesRepository();
      let query = FilmEntriesRepo.createQueryBuilder('entry')
        .innerJoinAndSelect('entry.movie', 'movie');
      
      const wheres: Array<[string, ObjectLiteral]> = [
        ['entry.userId = :userId', { userId }],
        ['entry.unsyncable = :isUnsyncable', { isUnsyncable: false }]
      ];

      if (actors.length > 0) {
        const minCastOrder = numericQueryParam(req.query.minCastOrder, 10000) - 1; // super high default if not provided, subtract 1 because the number is 1-indexed but needs to be zero-indexed for the real queries

        query = query
          .innerJoin(
            (subquery) => (
              subquery
                .select('m.id', 'id')
                .addSelect('ARRAY_AGG(jmc.personId)', 'ids')
                .from('movies', 'm')
                .innerJoin('join_movies_cast', 'jmc', 'jmc.movieId = m.id')
                .where('jmc.castOrder <= :minCastOrder', { minCastOrder })
                .groupBy('m.id')
            ), 
            'movie_actors', 
            'movie_actors.id = entry.movieId'
          );
        
        wheres.push([`movie_actors.ids @> ARRAY[${actors.join(',')}]`, {}]);
      }

      if (directors.length > 0) {
        const joinName = 'movie_directors';

        query = joinCrew({
          query,
          jobs: CREW_JOB_MAP.directors,
          joinName
        })

        wheres.push([whereCrew(joinName, directors), {}]);
      }

      if (writers.length > 0) {
        const joinName = 'movie_writers';

        query = joinCrew({
          query,
          jobs: CREW_JOB_MAP.writers,
          joinName
        })

        wheres.push([whereCrew(joinName, writers), {}]);
      }

      if (editors.length > 0) {
        const joinName = 'movie_editors';

        query = joinCrew({
          query,
          jobs: CREW_JOB_MAP.editors,
          joinName
        })

        wheres.push([whereCrew(joinName, editors), {}]);
      }

      if (cinematographers.length > 0) {
        const joinName = 'movie_cinematographers';

        query = joinCrew({
          query,
          jobs: CREW_JOB_MAP.cinematographers,
          joinName
        })

        wheres.push([whereCrew(joinName, cinematographers), {}]);
      }

      if (releaseDateRange.length === 2) {
        wheres.push([
          'movie.releaseDate BETWEEN :start AND :end',
          {
            start: releaseDateRange[0],
            end: releaseDateRange[1]
          }
        ]);
      }

      if (genres.length > 0) {
        wheres.push([
          `movie.genres @> ARRAY['${genres.join("','")}']`,
          {}
        ]);
      }

      if (excludedGenres.length > 0) {
        wheres.push([
          `NOT movie.genres && ARRAY['${excludedGenres.join("','")}']`,
          {}
        ])
      }

      if (collections.length > 0) {
        query = query.innerJoin('movie.collections', 'collection');
        wheres.push([`collection.id IN (${collections.join(',')})`, {}]);
      }

      const fullQuery = wheres.reduce((query, where, i) => {
        if (i === 0) {
          return query.where(...where);
        } else {
          return query.andWhere(...where);
        }
      }, query);

      try {
        // console.log('\n\n\n');
        // console.log(fullQuery.getSql());
        // console.log('params', query.getParameters());
        // console.log('\n\n\n');
        const results = await fullQuery.getRawMany<EntryQueryResult>();
        const entries = convertResultsToEntries(results);
        res.json({ entries });
      } catch (err) {
        res.status(500).json({ err });
      }
    }
  }
});

export default UserEntriesRoute;