import { ApiErrorResponse, ApiSuccessResponse } from "../../../../../common/types/api";
import { SyncStatus, SyncTrigger, SyncType } from "@rhodesjason/loxdb/dist/common/types/db";
import { getSyncRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { handleGenericError } from "@rhodesjason/loxdb/dist/lib/apiErrorHandler";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";
import { syncAllUserWatches, SyncLetterboxdError } from "@rhodesjason/loxdb/dist/lib/syncUserWatches";

const UserSyncRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
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

      if (!user) {
        const message = `No user found for user ID: ${numericUserId}`;
        console.error(message);
        return res.status(400).json({
          success: false,
          code: 400,
          message
        });
      }

      const { syncsInProgress, sync } = await SyncsRepo.queueSync({ trigger: SyncTrigger.USER, username: user?.username });

      if (syncsInProgress.length) {
        console.log('Oopsies daisies you can no do 2 syncy syncs hey!');
        SyncsRepo.skipSync(sync);
        return res.status(409).json({
          success: false,
          code: 409,
          message: "Sync already in progress for this user"
        });
      }

      res.status(200).json({ success: true });

      try {
        sync.type = SyncType.USER_RATINGS;
        SyncsRepo.startSync(sync);

        const { synced } = await syncAllUserWatches({
          userId: numericUserId
        });
        const numSynced = synced.watches.length;
        SyncsRepo.endSync(sync, { status: SyncStatus.COMPLETE, numSynced });
        
      } catch (error: any) {
        SyncsRepo.endSync(sync, { 
          status: SyncStatus.FAILED,
          numSynced: 0,
          errorMessage: getErrorAsString(error) 
        });
        console.error(`Error while syncing user watches for manual request ${user.username}`, error.message);
      }
    }
  }
});

export default UserSyncRoute;