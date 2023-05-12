import { ApiErrorResponse, ApiSuccessResponse } from "../../../../../common/types/api";
import { getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { syncRecentEntriesForUser } from "../../../../../lib/syncRecentEntriesForUser";

const UserSyncRoute = createApiRoute<ApiSuccessResponse & { syncedCount: number } | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const { userId = '' } = req.query;
      const numericUserId = numericQueryParam(userId);
      if (typeof numericUserId === "undefined" || isNaN(numericUserId)) {
        throw new Error('Invalid userID');
      }

      const UsersRepo = await getUserRepository();
      const user = await UsersRepo.findOneBy({ id: numericUserId });

      if (!user) {
        const message = `No user found for user ID: ${numericUserId}`;
        console.error(message);
        return res.status(400).json({
          success: false,
          code: 400,
          message
        });
      }

      try {
        const { syncedCount } = await syncRecentEntriesForUser({ user });
        return res.json({ success: true, syncedCount });
      } catch (error: any) {
        const message = `Error while syncing RECENT user watches ${user.username} -- ${error}`;
        console.error(message);
        return res.status(500).json({ success: false, code: 500, message });
      }
    }
  }
});

export default UserSyncRoute;