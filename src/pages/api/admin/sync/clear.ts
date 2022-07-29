import { getSyncRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";

const ClearSyncsRoute = createApiRoute({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      const SyncRepo = await getSyncRepository();
      await SyncRepo.clearUnfinished();
      res.json({ success: true });
    }
  }
});

export default ClearSyncsRoute;