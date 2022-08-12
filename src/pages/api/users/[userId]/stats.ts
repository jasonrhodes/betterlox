import { ApiErrorResponse, UserStatsResponse } from "../../../../common/types/api";
import { getCollectionsRepository, getPeopleRepository } from "../../../../db/repositories";
import { numericQueryParam, singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const PeopleApiRoute = createApiRoute<UserStatsResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      let stats: UserStatsResponse['stats'] = [];
      const userId = numericQueryParam(req.query.userId);
      const type = singleQueryParam(req.query.type);

      if (typeof userId !== "number") {
        return res.status(400).json({ success: false, code: 400, message: 'userId is required also how could this happen?!?' });
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
          const stats = await PeopleRepo.getHighestRated({ type, userId });
          res.json({ success: true, stats: stats || [] });
          break;
        }

        // case 'collections': {
        //   const CollectionsRepo = await getCollectionsRepository();
        //   const stats = [];//await CollectionsRepo.getHighestRated({ userId });
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