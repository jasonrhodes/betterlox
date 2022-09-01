import { SyncManagementApiResponse } from "../../../common/types/api";
import { Sync } from "../../../db/entities";
import { getSyncRepository } from "../../../db/repositories";
import { getErrorAsString } from "../../../lib/getErrorAsString";
import { numericQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

const SyncManagementRoute = createApiRoute<SyncManagementApiResponse>({
  handlers: {
    patch: async (req, res) => {
      const SyncsRepo = await getSyncRepository();
      const id = numericQueryParam(req.query.id);
      const updates = req.body as Partial<Sync>;
      
      try {
        await SyncsRepo.update({ id }, updates);
        res.json({ success: true });
      } catch (error: unknown) {
        console.log('Error updating sync', getErrorAsString(error));
        res.status(400).json({
          success: false,
          code: 400,
          message: 'An error occurred while trying to update this sync'
        });
      }
      
    }
  }
});

export default SyncManagementRoute;