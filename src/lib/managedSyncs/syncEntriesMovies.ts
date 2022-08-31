import { SyncType, SyncStatus } from "../../common/types/db";
import { Sync } from "../../db/entities";
import { getSyncRepository, getFilmEntriesRepository, getMoviesRepository } from "../../db/repositories";

export async function syncEntriesMovies(sync: Sync, limit?: number) {
  const SyncRepo = await getSyncRepository();
  // Check for ratings with missing movies
  sync.type = SyncType.RATINGS_MOVIES;
  const FilmEntriesRepo = await getFilmEntriesRepository();
  const missingMovies = await FilmEntriesRepo.getFilmEntriesWithMissingMovies(limit);

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