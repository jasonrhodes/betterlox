import { SyncType, SyncStatus } from "../../common/types/db";
import { Movie, Sync } from "../../db/entities";
import { getSyncRepository, getMoviesRepository, getCollectionsRepository } from "../../db/repositories";
import { tmdb } from "../tmdb";

function checkMovieForCollection(c: any) {
  if (!c) {
    return false;
  }
  let id = 0;
  let name = '';
  let posterPath: undefined | string = undefined;
  let backdropPath: undefined | string = undefined;

  if ('id' in c) {
    id = c.id as number;
  }

  if ('name' in c) {
    name = c.name as string;
  }

  if ('poster_path' in c) {
    posterPath = c.poster_path as string;
  }

  if ('backdrop_path' in c) {
    backdropPath = c.backdrop_path as string;
  }

  if (id > 0 && name.length > 0) {
    return { id, name, posterPath, backdropPath };
  }

  return false;
}

export async function syncOneMovieCollections(movie: Movie) {
  const tmdbMovie = await tmdb.movieInfo(movie.id);
  const c = checkMovieForCollection(tmdbMovie.belongs_to_collection);
  const MoviesRepo = await getMoviesRepository();

  if (c) {
    const CollectionsRepo = await getCollectionsRepository();
    const collection = CollectionsRepo.create(c);
    const saved = await CollectionsRepo.save(collection);
    console.log(`Found collection for ${movie.title}`, collection);
    movie.collections = [saved];
  }

  movie.syncedCollections = true;
  await MoviesRepo.save(movie);

  return {
    movie,
    syncedCollections: []
  };
}

export async function syncAllMoviesCollections(sync: Sync, limit?: number) {
  const SyncRepo = await getSyncRepository();
  // Check for ratings with missing movies
  sync.type = SyncType.MOVIES_COLLECTIONS;
  SyncRepo.save(sync);
  const MoviesRepo = await getMoviesRepository();
  const moviesWithMissingCollections = await MoviesRepo.getMissingCollections();
  const missingCount = moviesWithMissingCollections.length;
  if (missingCount === 0) {
    return { synced: [], count: 0 };
  }

  const maxToSync = limit ? Math.min(missingCount, limit) : missingCount;
  const synced: Movie[] = [];

  for (let i = 0; i < maxToSync; i++) {
    const movie = moviesWithMissingCollections[i];
    try {
      const { movie: updated } = await syncOneMovieCollections(movie);
      console.log('UPDATED', JSON.stringify(updated));
      synced.push(updated);
    } catch (error) {
      await SyncRepo.endSync(sync, {
        status: SyncStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "unknown error ocurred while syncing movie collections",
        numSynced: synced.length
      });
      console.log(JSON.stringify(movie.collections));
      console.log('Movie sync error', movie.id, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  await SyncRepo.endSync(sync, {
    status: SyncStatus.COMPLETE,
    numSynced: synced.length
  });

  return { synced, count: synced.length };
}