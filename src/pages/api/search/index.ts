import { FindManyOptions, FindOptionsWhere, ILike, In, Like } from "typeorm";
import { PeopleApiResponse, SearchApiResponse } from "../../../common/types/api";
import { Person } from "../../../db/entities";
import { getCollectionsRepository, getPeopleRepository } from "../../../db/repositories";
import { numericQueryParam, singleQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

function forceArray(value: string | string[] | undefined) {
  if (value === undefined) return value;
  return (Array.isArray(value) ? value.map(v => v.split(',')) : value.split(',')).flat();
}

const SearchApiRoute = createApiRoute<SearchApiResponse>({
  handlers: {
    get: async (req, res) => {
      // Shared
      const limit = numericQueryParam(req.query.limit);
      const ids = forceArray(req.query.ids);
      const searchType = singleQueryParam(req.query.searchType);
      const namePattern = singleQueryParam(req.query.name);
      const exactName = singleQueryParam(req.query.exactName);

      // People
      const role = singleQueryParam(req.query.role);

      switch (searchType) {
        case 'people': {
          const PeopleRepo = await getPeopleRepository();
          const results = await PeopleRepo.searchForApi({
            limit,
            ids,
            type: role,
            namePattern,
            exactName
          });
    
          res.json({ success: true, results });
          break;
        }
        case 'collections': {
          const CollectionsRepo = await getCollectionsRepository();
          const results = await CollectionsRepo.searchForApi({
            limit,
            ids,
            namePattern,
            exactName
          });

          res.json({ success: true, results });
        }

        
      }
     
    }
  }
});

export default SearchApiRoute;