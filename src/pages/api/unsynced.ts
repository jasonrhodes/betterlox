import { UnsyncedGetResponse } from "../../common/types/api";
import { getSyncRepository } from "../../db/repositories";
import { singleQueryParam } from "../../lib/queryParams";
import { createApiRoute } from "../../lib/routes";

const UnsyncedRoute = createApiRoute<UnsyncedGetResponse>({
  handlers: {
    get: async (req, res) => {

      const type = singleQueryParam(req.query.type);
      // switch (type) {
      //   case "un-ratings-movies":

          
      // }

      res.json({ success: true, unsynced: [] });
    }
  }
});

export default UnsyncedRoute;