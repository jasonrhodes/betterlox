import { SyncRounded } from "@mui/icons-material";
import { ApiErrorResponse, UserRatingsSyncApiResponse } from "../../../../../common/types/api";
import { SyncStatus, SyncTrigger, SyncType } from "../../../../../common/types/db";
import { getSyncRepository, getUserRepository } from "../../../../../db/repositories";
import { handleGenericError } from "../../../../../lib/apiErrorHandler";
import { getErrorAsString } from "../../../../../lib/getErrorAsString";
import { numericQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { syncAllRatingsForUser, SyncRatingsError } from "../../../../../lib/syncAllRatingsForUser";

const UserSyncRoute = createApiRoute<UserRatingsSyncApiResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const { userId = '' } = req.query;
      const numericUserId = numericQueryParam(userId);
      if (typeof numericUserId === "undefined" || isNaN(numericUserId)) {
        throw new Error('Invalid userID');
      }

      const SyncsRepo = await getSyncRepository();
      const UsersRepo = await getUserRepository();
      const user = await UsersRepo.findOneBy({ id: numericUserId });
      const { started, sync } = await SyncsRepo.queueSync({ trigger: SyncTrigger.USER, username: user?.username });

      if (started.length) {
        SyncsRepo.skipSync(sync);
        return res.status(200).json({
          success: false,
          code: 200,
          message: "Sync already in progress for this user"
        });
      }

      try {
        sync.type = SyncType.USER_RATINGS;
        SyncsRepo.startSync(sync);
        const { synced } = await syncAllRatingsForUser({
          userId: numericUserId,
          username: user?.username,
          order: "ASC" 
        });
        SyncsRepo.endSync(sync, { status: SyncStatus.COMPLETE, numSynced: synced.length || 0 });
        res.status(200).json({ success: true, synced, count: synced.length });
      } catch (error: unknown) {
        SyncsRepo.endSync(sync, { 
          status: SyncStatus.FAILED,
          numSynced: 0,
          errorMessage: getErrorAsString(error) 
        });
        if (error instanceof SyncRatingsError) {
          const { message } = error;
          res.status(500).json({ success: false, code: 500, message });
        } else {
          handleGenericError(error, res);
        }
      }
    }
  }
});

export default UserSyncRoute;