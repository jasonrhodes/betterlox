import { getFilmEntriesRepository } from "../../../../../db/repositories/FilmEntriesRepo";
import { numericQueryParam, singleQueryParam, stringListQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { ArrayContains, ArrayOverlap, Between, FindOptionsWhere, In, LessThanOrEqual, Not } from "typeorm";
import merge from "lodash.merge";
import { convertYearsToRange } from "../../../../../lib/convertYearsToRange";
import { FilmEntry } from "../../../../../db/entities";

function first(x: string | string[]) {
  return Array.isArray(x) ? x[0] : x;
}

function whereJob(jobs: string[], ids: string[]): FindOptionsWhere<FilmEntry> {
  return {
    movie: {
      crew: {
        job: In(jobs),
        person: {
          id: In(ids)
        }
      }
    }
  }
}

const UserEntriesRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      const releaseDateRange = convertYearsToRange(singleQueryParam(req.query.releaseDateRange));
      const genres = stringListQueryParam(req.query.genres);
      
      // start with an array of where clauses that will
      // be reduced back into a single where clause, so
      // that all options will be "AND" joined (not "OR")
      const wheres: FindOptionsWhere<FilmEntry>[] = [];

      const baselineConditions: FindOptionsWhere<FilmEntry> = {
        userId: numericQueryParam(req.query.userId),
        unsyncable: false
      };

      if (releaseDateRange.length === 2) {
        wheres.push({
          movie: {
            releaseDate: Between(releaseDateRange[0], releaseDateRange[1])
          }
        })
      }

      if (genres.length > 0) {
        wheres.push({
          movie: {
            genres: ArrayContains(genres)
          }
        })
      }

      if (req.query.actors) {
        const actors = first(req.query.actors);
        const minCastOrder = numericQueryParam(req.query.minCastOrder, 10000) - 1; // super high default if not provided, subtract 1 because the number is 1-indexed but needs to be zero-indexed for the real queries

        wheres.push({
          movie: {
            cast: {
              castOrder: LessThanOrEqual(minCastOrder),
              actor: {
                id: In(actors.split(','))
              }
            }
          }
        });
      }

      if (req.query.collections) {
        const collections = first(req.query.collections);
        wheres.push({
          movie: {
            collections: {
              id: In(collections.split(','))
            }
          }
        })
      }

      if (req.query.directors) {
        const directors = first(req.query.directors);
        wheres.push(whereJob(
          ['Director'],
          directors.split(',')
        ));
      }
      
      if (req.query.writers) {
        const writers = first(req.query.writers);
        wheres.push(whereJob(
          ['Writer', 'Screenplay', 'Story'],
          writers.split(',')
        ));
      }

      if (req.query.cinematographers) {
        const cinematographers = first(req.query.cinematographers);
        wheres.push(whereJob(
          ['Cinematographer', 'Director of Photography'],
          cinematographers.split(',')
        ));
      }

      if (req.query.editors) {
        const editors = first(req.query.editors);
        wheres.push(whereJob(
          ['Editor'],
          editors.split(',')
        ));
      }
      
      // Reduce array of where clauses into a single "AND" clause
      // otherwise the array would be treated as "OR"
      const where = [{
        ...baselineConditions,
        ...wheres.reduce((a, b) => merge(a, b), {})
      }];

      // add baseline criteria to every where condition so that
      // they are treated as "OR", which is actually what we want
      // const where = wheres.length === 0 ? baselineConditions : wheres.map((condition) => ({
      //   ...condition,
      //   ...baselineConditions
      // }));
      
      try {
        const FilmEntriesRepo = await getFilmEntriesRepository();
        const entries = await FilmEntriesRepo.find({
          where,
          order: {
            date: 'ASC'
          }
        });
        res.json({ entries });
      } catch (err) {
        res.status(500).json({ err });
      }
    }
  }
});

export default UserEntriesRoute;