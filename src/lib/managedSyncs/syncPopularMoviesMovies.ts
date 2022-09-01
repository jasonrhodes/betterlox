import { SyncStatus, SyncType } from "../../common/types/db";
import { Sync } from "../../db/entities";
import { getMoviesRepository, getPopularLetterboxdMoviesRepository, getSyncRepository } from "../../db/repositories";

interface Options {
  limit?: number;
  force?: boolean;
}

export async function syncPopularMoviesMovies(sync: Sync, {
  limit,
  force
}: Options) {

  const SyncRepo = await getSyncRepository();
  sync.type = SyncType.POPULAR_MOVIES_MOVIES;
  SyncRepo.save(sync);

  const PopularMoviesRepo = await getPopularLetterboxdMoviesRepository();
  const missingMovies = await PopularMoviesRepo.getPopularMoviesWithMissingMovies(limit);

  if (missingMovies.length === 0) {
    return [];
  }

  const MoviesRepo = await getMoviesRepository();
  const synced = await MoviesRepo.syncMovies(missingMovies);
  if (synced.length > 0) {
    await SyncRepo.endSync(sync, {
      status: SyncStatus.COMPLETE,
      numSynced: synced.length
    });
  } else {
    console.log(`Attempted to sync ${missingMovies.length} movies, but 0 were synced.\n${JSON.stringify(missingMovies)}`);
  }
  return synced;
}