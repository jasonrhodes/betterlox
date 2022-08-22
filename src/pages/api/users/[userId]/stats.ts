import { ApiErrorResponse, StatMode, UserStatsResponse } from "../../../../common/types/api";
import { getCollectionsRepository, getPeopleRepository } from "../../../../db/repositories";
import { numericQueryParam, singleQueryParam, stringListQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

function convertYearsToRange(year?: string) {
  if (!year) {
    return [];
  }

  if (year.startsWith('Decade')) {
    const startingYear = Number(year.substring(8, 12));
    const start = `${startingYear}-01-01`;
    const end = `${startingYear + 9}-12-31`;

    return [start, end];
  }

  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return [start, end];
}

const PeopleApiRoute = createApiRoute<UserStatsResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId);
      const minWatched = numericQueryParam(req.query.minWatched, 1);
      const minCastOrder = numericQueryParam(req.query.minCastOrder, 25);
      const type = singleQueryParam(req.query.type);
      const mode = singleQueryParam<StatMode>(req.query.mode) || 'favorite';
      const dateRange = convertYearsToRange(singleQueryParam(req.query.years));
      const genres = stringListQueryParam(req.query.genres);
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