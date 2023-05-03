import { SyncsManagementGetResponse } from "../../../common/types/api";
import { getSyncRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { createApiRoute } from "../../../lib/routes";

const SyncsManagementRoute = createApiRoute<SyncsManagementGetResponse>({
  handlers: {
    get: async (req, res) => {
      const SyncsRepo = await getSyncRepository();
      const syncs = await SyncsRepo.find({
        order: {
          started: 'DESC'
        },
        take: 200
      });
      res.json({ success: true, syncs });
    }
  }
});

export default SyncsManagementRoute;