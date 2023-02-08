import { getSyncRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";
import { SyncResponse } from "../../../../common/types/api";
import { SyncStatus, SyncTrigger, SyncType } from "../../../../common/types/db";
import { numericQueryParam, singleQueryParam } from "../../../../lib/queryParams";
import { syncCastPeople, syncCrewPeople } from "../../../../lib/managedSyncs/syncPeople";
import { syncAllMoviesCredits } from "../../../../lib/managedSyncs/syncMoviesCredits";
import { syncAllMoviesCollections } from "../../../../lib/managedSyncs/syncMoviesCollections";
import { syncPopularMoviesPerYear, syncPopularMoviesPerGenre } from "../../../../lib/managedSyncs/syncMovies";
import { syncEntriesMovies } from "../../../../lib/managedSyncs/syncEntriesMovies";
import { syncPopularMoviesMovies } from "../../../../lib/managedSyncs/syncPopularMoviesMovies";

const SyncRatingsRoute = createApiRoute<SyncResponse>({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      // get sync status
      const SyncRepo = await getSyncRepository();
      const { syncsInProgress, sync } = await SyncRepo.queueSync({ trigger: SyncTrigger.SYSTEM });

      const force = singleQueryParam(req.query.force) === "true";
      const forceType = singleQueryParam(req.query.forceType);
      const numericLimit = numericQueryParam(req.query.limit);

      if (syncsInProgress.length > 0 && !force) {
        // sync already pending or in progress
        console.log('Skipping admin sync, there is already a sync in progress');
        await SyncRepo.skipSync(sync);
        return res.status(200).json({ success: false, type: 'none', synced: [], message: 'Sync already pending or in progress' });
      } else {
        console.log('Beginning admin sync');
        await SyncRepo.startSync(sync);
      }

      try {
        // Pull x years, y movies per year from letterboxd
        if (!forceType || forceType === "popular_movies_per_year") {
          console.log('Evaluating the popular movies per year sync...');
          const n = await syncPopularMoviesPerYear(sync, { 
            yearBatchSize: 20,
            moviesPerYear: 100
          });
          if (n > 0) {
            return res.status(200).json({ 
              success: true, 
              type: 'popular_movies_per_year', 
              syncedCount: n 
            });
          }
        }

        // Pull y movies per genre from letterboxd
        if (!forceType || forceType === "popular_movies_per_genre") {
          console.log('Evaluating the popular movies per genre sync...');
          const n = await syncPopularMoviesPerGenre(sync, {
            force,
            moviesPerGenre: 100
          });
          if (n > 0) {
            return res.status(200).json({ 
              success: true, 
              type: 'popular_movies_per_genre', 
              syncedCount: n 
            });
          }
        }

        // Check for user entries with missing movie records
        if (!forceType || forceType === "entries_movies") {
          console.log('Syncing entries -> movies...');
          const syncedMovies = await syncEntriesMovies(sync, numericLimit);
          if (syncedMovies.length > 0) {
            return res.status(200).json({ success: true, type: 'entries_movies', synced: syncedMovies });
          }
        }

        // Check for popular movie rows with missing full movie records
        if (!forceType || forceType === "popular_movies_movies") {
          console.log('Syncing popular movies -> movies');
          const synced = await syncPopularMoviesMovies(sync, { limit: numericLimit, force });
          if (synced.length > 0) {
            return res.status(200).json({ 
              success: true,
              type: 'popular_movies_movies',
              syncedCount: synced.length
            });
          }
        }

        
        if (!forceType || forceType === "movies_credits") {
          console.log('Syncing movies -> credits (cast and crew)...')
          const syncedCredits = await syncAllMoviesCredits(sync, numericLimit);
          if (syncedCredits.cast.length > 0 || syncedCredits.crew.length > 0) {
            return res.status(200).json({ success: true, type: 'movies_credits', synced: syncedCredits })
          }
        }

        if (!forceType || forceType === "movies_cast") {
          // Check for cast roles with missing people records
          console.log('Syncing cast roles...');
          const syncedCast = await syncCastPeople(sync, numericLimit);
          if (syncedCast.length > 0) {
            return res.status(200).json({ success: true, type: 'movies_cast', synced: syncedCast });
          }
        }

        if (!forceType || forceType === "movies_crew") {
          // Check for crew roles with missing people records
          console.log('Syncing crew roles...');
          const syncedCrew = await syncCrewPeople(sync, numericLimit);
          if (syncedCrew.length > 0) {
            return res.status(200).json({ success: true, type: 'movies_crew', synced: syncedCrew });
          }
        }

        if (!forceType || forceType === "movies_collections") {
          // Check for movies with missing collections
          console.log('Syncing movies -> collections');
          const { synced: syncedCollections, count } = await syncAllMoviesCollections(sync, numericLimit);
          if (syncedCollections.length > 0) {
            return res.status(200).json({ success: true, type: 'movies_collections', synced: syncedCollections, count });
          }
        }

        console.log('Nothing was synced');
        await SyncRepo.endSync(sync, {
          type: SyncType.NONE,
          status: SyncStatus.COMPLETE,
          numSynced: 0
        });
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