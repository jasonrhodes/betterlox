import { getSyncRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";
import { SyncResponse } from "../../../../common/types/api";
import { SyncStatus, SyncTrigger } from "../../../../common/types/db";
import { numericQueryParam } from "../../../../lib/queryParams";
import { syncRatingsMovies } from "../../../../lib/managedSyncs/syncRatingsMovies";
import { syncCastPeople, syncCrewPeople } from "../../../../lib/managedSyncs/syncPeople";
import { syncMoviesCredits } from "../../../../lib/managedSyncs/syncMoviesCredits";

const SyncRatingsRoute = createApiRoute<SyncResponse>({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      // get sync status
      const SyncRepo = await getSyncRepository();
      const { started, sync } = await SyncRepo.queueSync({ trigger: SyncTrigger.SYSTEM });

      const force = req.query.force;

      if (started.length > 0 && !force) {
        // sync already pending or in progress
        await SyncRepo.skipSync(sync);
        return res.status(200).json({ success: false, type: 'none', synced: [], message: 'Sync already pending or in progress' });
      } else {
        await SyncRepo.startSync(sync);
      }

      try {
        const numericLimit = numericQueryParam(req.query.limit);

        // Check for ratings with missing movie records
        console.log('Syncing ratings -> movies...');
        const syncedMovies = await syncRatingsMovies(sync, numericLimit);
        if (syncedMovies.length > 0) {
          return res.status(200).json({ success: true, type: 'ratings_movies', synced: syncedMovies });
        }

        console.log('Syncing movies -> credits (cast and crew)...')
        const syncedCredits = await syncMoviesCredits(sync, numericLimit);
        if (syncedCredits.cast.length > 0 || syncedCredits.crew.length > 0) {
          return res.status(200).json({ success: true, type: 'movies_credits', synced: syncedCredits })
        }

        // Check for cast roles with missing people records
        console.log('Syncing cast roles...');
        const syncedCast = await syncCastPeople(sync, numericLimit);
        if (syncedCast.length > 0) {
          return res.status(200).json({ success: true, type: 'movies_cast', synced: syncedCast });
        }

        // Check for crew roles with missing people records
        console.log('Syncing crew roles...');
        const syncedCrew = await syncCrewPeople(sync, numericLimit);
        if (syncedCrew.length > 0) {
          return res.status(200).json({ success: true, type: 'movies_crew', synced: syncedCrew });
        }

        console.log('Nothing was synced');
        res.json({ success: true, type: 'none', synced: [], message: 'Nothing was synced' });
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error occurred";
        await SyncRepo.endSync(sync, {
          status: SyncStatus.FAILED,
          errorMessage
        });
        res.status(500).json({ success: false, code: 500, message: errorMessage });
      }
    }
  }
});

export default SyncRatingsRoute;