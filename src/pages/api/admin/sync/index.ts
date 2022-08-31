import { getSyncRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";
import { SyncResponse } from "../../../../common/types/api";
import { SyncStatus, SyncTrigger, SyncType } from "../../../../common/types/db";
import { numericQueryParam } from "../../../../lib/queryParams";
import { syncCastPeople, syncCrewPeople } from "../../../../lib/managedSyncs/syncPeople";
import { syncAllMoviesCredits } from "../../../../lib/managedSyncs/syncMoviesCredits";
import { syncAllMoviesCollections } from "../../../../lib/managedSyncs/syncMoviesCollections";
import { syncAllMoviesByYear } from "../../../../lib/managedSyncs/syncMovies";
import { syncEntriesMovies } from "../../../../lib/managedSyncs/syncEntriesMovies";
import { MoreThan } from "typeorm";

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
        const now = new Date();
        const yesterday = (new Date(now.getTime() - (1000 * 60 * 60 * 24))).toISOString().substring(0, 10);

        const movieSyncsCompletedDuringPastDay = force ? [] : await SyncRepo.findBy({
          finished: MoreThan(new Date(yesterday)),
          status: SyncStatus.COMPLETE,
          type: SyncType.MOVIES
        });

        console.log('Successful, completed movie syncs in the past day:', movieSyncsCompletedDuringPastDay);

        if (!movieSyncsCompletedDuringPastDay.length) {
          console.log('Syncing movies by year...');
          // sync movies from letterboxd /by/year pages
          const n = await syncAllMoviesByYear(sync, {
            startYear: 1900
          });

          if (n > 0) {
            return res.status(200).json({ success: true, type: 'movies', syncedCount: n })
          }
        }

        // Check for ratings with missing movie records
        console.log('Syncing entries -> movies...');
        const syncedMovies = await syncEntriesMovies(sync, numericLimit);
        if (syncedMovies.length > 0) {
          return res.status(200).json({ success: true, type: 'entries_movies', synced: syncedMovies });
        }

        console.log('Syncing movies -> credits (cast and crew)...')
        const syncedCredits = await syncAllMoviesCredits(sync, numericLimit);
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

        // Check for movies with missing collections
        console.log('Syncing movies -> collections');
        const { synced: syncedCollections, count } = await syncAllMoviesCollections(sync, numericLimit);
        if (syncedCollections.length > 0) {
          return res.status(200).json({ success: true, type: 'movies_collections', synced: syncedCollections, count });
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