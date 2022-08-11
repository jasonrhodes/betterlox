import { RatingsFilters } from "../../../../../common/types/api";
import { getRatingsRepository } from "../../../../../db/repositories/RatingsRepo";
import { numericQueryParam, singleQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { FindOptionsWhere, In } from "typeorm";
import { Rating } from "../../../../../db/entities";
import merge from "lodash.merge";

function first(x: string | string[]) {
  return Array.isArray(x) ? x[0] : x;
}

function whereJob(jobs: string[], ids: string[]): FindOptionsWhere<Rating> {
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

const UserRatingsRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      // start with an array of where clauses that will
      // be reduced back into a single where clause, so
      // that all options will be "AND" joined (not "OR")
      const wheres: FindOptionsWhere<Rating>[] = [];

      // wheres.push({
      //   userId: numericQueryParam(req.query.userId),
      //   unsyncable: false
      // });

      if (req.query.actors) {
        const actors = first(req.query.actors);
        wheres.push({
          movie: {
            cast: {
              actor: {
                id: In(actors.split(','))
              }
            }
          }
        })
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
      
      // (Update: Oops) reduce array of where clauses into a single "AND" clause
      // otherwise the array would be treated as "OR"
      // const where = wheres.reduce((a, b) => merge(a, b), {});

      const baselineConditions = {
        userId: numericQueryParam(req.query.userId),
        unsyncable: false
      };

      // add baseline criteria to every where condition so that
      // they are treated as "OR", which is actually what we want
      const where = wheres.length === 0 ? baselineConditions : wheres.map((condition) => ({
        ...condition,
        ...baselineConditions
      }));
      
      try {
        const RatingsRepository = await getRatingsRepository();
        const ratings = await RatingsRepository.find({
          where,
          order: {
            date: "DESC"
          },
          relations: {
            movie: true
          }
        });
        res.json({ ratings });
      } catch (err) {
        res.status(500).json({ err });
      }
    }
  }
});

export default UserRatingsRoute;