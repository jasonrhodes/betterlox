import { SyncType, SyncStatus } from "../../common/types/db";
import { CastRole, CrewRole, Movie, Sync } from "../../db/entities";
import { getSyncRepository, getMoviesRepository } from "../../db/repositories";
import { addCast, addCrew } from "../addCredits";
import { getErrorAsString } from "../getErrorAsString";
import { tmdb } from "../tmdb";

export async function syncOneMovieCredits(movie: Movie) {
  const syncedCastRoles: CastRole[] = [];
  const syncedCrewRoles: CrewRole[] = [];
  const { cast, crew } = await tmdb.movieCredits(movie.id);
  try {
    console.log(`Syncing cast for movie:${movie.id}/${movie.title}`);
    const castRoles = await addCast({ cast, movieId: movie.id });
    castRoles.forEach(c => c ? syncedCastRoles.push(c) : null);
  } catch (error: unknown) {
    console.log(getErrorAsString(error));
  }
  try {
    const crewRoles = await addCrew({ crew, movieId: movie.id });
    crewRoles.forEach(c => c ? syncedCrewRoles.push(c) : null);
  } catch (error) {
    console.log(getErrorAsString(error));
  }

  return { syncedCastRoles, syncedCrewRoles };
}

export async function syncAllMoviesCredits(sync: Sync, limit?: number) {
  const SyncRepo = await getSyncRepository();
  sync.type = SyncType.MOVIES_CREDITS;
  SyncRepo.save(sync);
  const MoviesRepo = await getMoviesRepository();
  const moviesWithMissingCredits = await MoviesRepo.getMissingCredits(limit);
  if (moviesWithMissingCredits.length === 0) {
    return { cast: [], crew: [], length: 0 };
  }

  let allSyncedCastRoles: CastRole[] = [];
  let allSyncedCrewRoles: CrewRole[] = [];

  for (let i = 0; i < moviesWithMissingCredits.length; i++) {
    const movie = moviesWithMissingCredits[i];
    const { syncedCastRoles, syncedCrewRoles } = await syncOneMovieCredits(movie);
    allSyncedCastRoles = allSyncedCastRoles.concat(syncedCastRoles);
    allSyncedCrewRoles = allSyncedCrewRoles.concat(syncedCrewRoles);
    movie.syncedCredits = true;

    try {
      await MoviesRepo.save(movie);
    } catch (error) {
      console.log(JSON.stringify(movie.crew));
      console.log('Movie save error', movie.id, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  const numSynced = allSyncedCastRoles.length + allSyncedCrewRoles.length;

  if (allSyncedCastRoles.length > 0 || allSyncedCrewRoles.length > 0) {
    await SyncRepo.endSync(sync, {
      status: SyncStatus.COMPLETE,
      numSynced
    });
  } else {
    console.log(`Attempted to sync ${moviesWithMissingCredits.length} movies, but 0 credits were synced.\n${JSON.stringify(moviesWithMissingCredits)}`);
  }

  return { cast: allSyncedCastRoles, crew: allSyncedCrewRoles, length: numSynced };
}