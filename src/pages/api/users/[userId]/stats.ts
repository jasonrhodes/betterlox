import { ApiErrorResponse, StatMode, UserStatsResponse } from "../../../../common/types/api";
import { getPeopleRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { convertYearsToRange } from "@rhodesjason/loxdb/dist/lib/convertYearsToRange";
import { numericQueryParam, singleQueryParam, stringListQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const PeopleApiRoute = createApiRoute<UserStatsResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId);
      const minWatched = numericQueryParam(req.query.minWatched, 1);
      
      // needs to be zero-indexed but UI will show it as 1-indexed
      const minCastOrder = numericQueryParam(req.query.minCastOrder, 26) - 1;
      
      const type = singleQueryParam(req.query.type);
      const mode = singleQueryParam<StatMode>(req.query.mode) || 'favorite';
      const dateRange = convertYearsToRange(singleQueryParam(req.query.releaseDateRange));
      const genres = stringListQueryParam(req.query.genres);
      const excludedGenres = stringListQueryParam(req.query.excludedGenres);
      const allGenres = Boolean(singleQueryParam(req.query.allGenres));
      const onlyWomen = Boolean(singleQueryParam(req.query.onlyWomen));
      const onlyNonBinary = Boolean(singleQueryParam(req.query.onlyNonBinary));

      if (typeof userId !== "number") {
        return res.status(400).json({ 
          success: false, 
          code: 400, 
          message: 'userId is required also how could this happen?!?' 
        });
      }

      if (!type) {
        return res.status(400).json({ success: false, code: 400, message: 'type is required' });
      }

      switch (type) {
        case 'actors':
        case 'directors': 
        case 'writers':
        case 'cinematographers': 
        case 'editors': {
          const PeopleRepo = await getPeopleRepository();
          const stats = await PeopleRepo.getStats({ 
            type, 
            userId, 
            orderBy: mode, 
            minWatched, 
            minCastOrder,
            dateRange,
            genres,
            excludedGenres,
            allGenres,
            onlyWomen,
            onlyNonBinary
          });
          res.json({ success: true, stats: stats || [] });
          break;
        }

        // case 'collections': {
        //   const CollectionsRepo = await getCollectionsRepository();
        //   const stats = [];//await CollectionsRepo.getStats({ userId, orderBy: mode });
        //   res.json({ success: true, stats });
        //   break;
        // }

        default: {
          res.status(400).json({ success: false, code: 400, message: 'Invalid type provided' });
          break;
        }
      }
    }
  }
});

export default PeopleApiRoute;