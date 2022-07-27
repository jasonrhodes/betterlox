import {
  getRatingsRepository,
  getMoviesRepository,
  getCastRepository,
  getCrewRepository,
  getSyncRepository,
  getPeopleRepository
} from "../../../db/repositories";
import { createAdminRoute } from "../../../lib/createAdminRoute";
import { SyncResponse } from "../../../common/types/api";
import { SyncStatus, SyncType } from "../../../common/types/db";
import { numericQueryParam } from "../../../lib/queryParams";

const SyncRatingsRoute = createAdminRoute<SyncResponse>(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, code: 405, message: 'Only POST allowed' });
    return;
  }

  // get sync status
  const SyncRepo = await getSyncRepository();
  const { started, sync } = await SyncRepo.queueSync();

  if (started.length > 0) {
    // sync already pending or in progress
    await SyncRepo.skipSync(sync);
    return res.status(200).json({ success: true, synced: [], message: 'Sync already pending or in progress' });
  } else {
    await SyncRepo.startSync(sync);
  }

  try {
    const numericLimit = numericQueryParam(req.query.limit);

    // Check for ratings with missing movies
    console.log('Syncing movies');
    sync.type = SyncType.RATINGS_MOVIES;
    const RatingsRepo = await getRatingsRepository();
    const missingMovies = (await RatingsRepo.getRatingsWithMissingMovies(numericLimit));

    if (missingMovies.length > 0) {
      const MoviesRepo = await getMoviesRepository();
      const synced = await MoviesRepo.syncMovies(missingMovies);
      if (synced.length > 0) {
        await SyncRepo.endSync(sync, {
          status: SyncStatus.COMPLETE,
          numSynced: synced.length
        });
        return res.status(200).json({ success: true, missingMovies: missingMovies.map(({ movieId }) => movieId), synced });
      } else {
        console.log(`Attempted to sync ${missingMovies.length} movies, but 0 were synced. Attempted IDs: ${missingMovies.join(', ')}`);
        // continue to next sync type in this case...
      }
    }

    // Check for cast roles with missing people records
    console.log('Syncing cast roles...');
    sync.type = SyncType.MOVIES_CAST;
    const CastRepo = await getCastRepository();
    const missingCastPeople = await CastRepo.getCastRolesWithMissingPeople(numericLimit);

    if (missingCastPeople.length > 0) {
      const PeopleRepo = await getPeopleRepository();
      const synced = await PeopleRepo.syncPeople(missingCastPeople);
      if (synced.length > 0) {
        await SyncRepo.endSync(sync, {
          status: SyncStatus.COMPLETE,
          numSynced: synced.length
        });
        return res.status(200).json({ success: true, missingPeople: missingCastPeople, synced });
      } else {
        console.log(`Attempted to sync ${missingCastPeople.length} people, but 0 were synced. Attempted IDs: ${missingCastPeople.join(', ')}`);
        sync.numSynced = 0;
        // continue to next sync type in this case...
      }
    }

    // Check for crew roles with missing people records
    console.log('Syncing crew roles...');
    sync.type = SyncType.MOVIES_CREW;
    const CrewRepo = await getCrewRepository();
    const missingCrewPeople = await CrewRepo.getCrewRolesWithMissingPeople(numericLimit);

    if (missingCrewPeople.length > 0) {
      const PeopleRepo = await getPeopleRepository();
      const synced = await PeopleRepo.syncPeople(missingCrewPeople);
      if (synced.length > 0) {
        await SyncRepo.endSync(sync, {
          status: SyncStatus.COMPLETE,
          numSynced: synced.length
        });
        return res.status(200).json({ success: true, missingPeople: missingCrewPeople, synced });
      } else {
        const message = `Attempted to sync ${missingCrewPeople.length} people, but 0 were synced. Attempted IDs: ${missingCrewPeople.join(', ')}`
        console.log(message);
        sync.numSynced = 0;
        // continue to next sync type in this case...
      }
    }

    console.log('Nothing was synced');
    res.json({ success: true, synced: [], message: 'Nothing was synced' });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error occurred";
    await SyncRepo.endSync(sync, {
      status: SyncStatus.FAILED,
      errorMessage
    });
    res.status(500).json({ success: false, code: 500, message: errorMessage });
  }
});

export default SyncRatingsRoute;