import { FindManyOptions, FindOptionsWhere, ILike, In, Like } from "typeorm";
import { PeopleApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { Person } from "@rhodesjason/loxdb/dist/db/entities";
import { getPeopleRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

function forceArray(value: string | string[] | undefined) {
  if (value === undefined) return value;
  return (Array.isArray(value) ? value.map(v => v.split(',')) : value.split(',')).flat();
}

const PeopleApiRoute = createApiRoute<PeopleApiResponse>({
  handlers: {
    get: async (req, res) => {
      const PeopleRepository = await getPeopleRepository();
      const options: FindManyOptions<Person> = {};

      const limit = singleQueryParam(req.query.limit);
      if (limit) {
        options.take = Number(limit);
      }

      const where: FindOptionsWhere<Person> = {};
      const ids = forceArray(req.query.ids);
      if (ids) {
        where.id = In(ids);
      }

      const type = singleQueryParam(req.query.role);
      if (type === "actor") {
        where.castRoles = true;
      } else if (type) {
        where.crewRoles = {
          job: type
        }
      }

      const namePattern = singleQueryParam(req.query.name);
      if (namePattern) {
        where.name = ILike(`%${namePattern.replace(' ', '%')}%`);
      }

      const exactName = singleQueryParam(req.query.exactName);
      if (exactName) {
        where.name = exactName;
      }

      options.where = where;
      options.order = {
        popularity: 'DESC'
      };

      const people = await PeopleRepository.find(options);

      res.json({ success: true, people });
    }
  }
});

export default PeopleApiRoute;