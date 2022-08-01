import { SyncTrigger } from "../../../../common/types/db";
import { getSyncRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";

const ClearSyncsRoute = createApiRoute({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      const SyncRepo = await getSyncRepository();
      await SyncRepo.clearUnfinished({ trigger: SyncTrigger.SYSTEM });
      res.json({ success: true });
    }
  }
});

export default ClearSyncsRoute;