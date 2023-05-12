import { UserSyncApiResponse } from "../../../common/types/api";
import { createApiRoute } from "../../../lib/routes";
import { getLetterboxdUserEntrySyncRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";

const UserSyncApi = createApiRoute<UserSyncApiResponse>({
  handlers: {
    get: async (req, res) => {
      const { id } = req.query;
      const numericId = Number(id);

      if (Array.isArray(id) || id === undefined || isNaN(numericId)) {
        res.status(400).json({ success: false, code: 400, message: `Numeric user ID is required in this route, received ${id} (${typeof id})` })
        return;
      }

      try {
        const UserSyncsRepo = await getLetterboxdUserEntrySyncRepository();
        const sync = await UserSyncsRepo.findOne({
          where: { 
            id: numericId 
          },
          relations: {
            user: true
          }
        });        

        if (sync === null) {
          res.status(404).json({ success: false, code: 404, message: `This sync ID (${id}) does not exist` })
          return;
        }

        res.json({ success: true, sync });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: String(err) })
      }
    }
  }
});

export default UserSyncApi;