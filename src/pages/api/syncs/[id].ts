import { SyncManagementApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { Sync } from "@rhodesjason/loxdb/dist/db/entities";
import { getSyncRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
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