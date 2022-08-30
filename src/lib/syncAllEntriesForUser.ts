import { FilmEntry } from "../db/entities";
import { getFilmEntriesRepository, getUserRepository } from "../db/repositories";
import { 
  findLastRatingsPage, 
  findLastWatchesPage,
  scrapeRatingsByPage,
  scrapeWatchesByPage
} from "./letterboxd";

export class SyncLetterboxdError extends Error {
  synced?: FilmEntry[];
  username?: string;

  constructor(message: string, { synced, username }: { synced?: FilmEntry[]; username?: string; } = {}) {
    super(message);
    this.username = username;
    this.synced = synced;
  }
}

interface SyncPageOptions {
  userId: number;
  username: string;
  page: number;
}

async function syncWatchesForPage({ userId, username, page }: SyncPageOptions) {
  const FilmEntriesRepo = await getFilmEntriesRepository();
  const { watches } = await scrapeWatchesByPage({ username, page });

  if (watches.length === 0) {
    return [];
  }

  const syncedForPage: FilmEntry[] = [];

  for (let i = 0; i <= watches.length; i++) {
    const watched = watches[i];
    if (!watched) {
      break;
    }

    const {
      movieId,
      name,
      letterboxdSlug
    } = watched;

    if (typeof movieId !== "number") {
      throw new Error('Invalid TMDB ID');
    }

    if (typeof name !== "string") {
      throw new Error(`Invalid name ${name}`);
    }

    try {
      const watchInfo = {
        movieId,
        userId,
        letterboxdSlug,
        name
      };
      const found = await FilmEntriesRepo.findOneBy(watchInfo);
      if (found) {
        // we have come across a rating that we already have in the db
        // so we don't need to continue processing this page
        break;
      }
      const watchToInsert = FilmEntriesRepo.create(watchInfo);
      const saved = await FilmEntriesRepo.save(watchToInsert);
      syncedForPage.push(saved);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullMessage = `Error while syncing watches for Letterboxd user ${username} for user ID ${userId}: ${errorMessage}`;
      console.log(fullMessage)
      throw new Error(fullMessage);
    }
  }

  return syncedForPage;
}

async function syncRatingsForPage({ userId, username, page }: SyncPageOptions) {
  const FilmEntriesRepo = await getFilmEntriesRepository();
  const { ratings } = await scrapeRatingsByPage({ username, page });
  if (ratings.length === 0) {
    return [];
  }

  const syncedForPage: FilmEntry[] = [];

  for (let i = 0; i <= ratings.length; i++) {
    const rating = ratings[i];
    if (!rating) {
      break;
    }

    const {
      movieId,
      name,
      stars,
      date,
      letterboxdSlug
    } = rating;

    if (typeof movieId !== "number") {
      throw new Error('Invalid TMDB ID');
    }

    if (typeof stars !== "number") {
      throw new Error(`Invalid star rating ${stars}`);
    }

    if (!(date instanceof Date)) {
      throw new Error(`Invalid date ${date}`);
    }

    if (typeof name !== "string") {
      throw new Error(`Invalid name ${name}`);
    }

    try {
      const ratingInfo = {
        movieId,
        userId,
        stars,
        date,
        letterboxdSlug,
        name
      };
      const foundRating = await FilmEntriesRepo.findOneBy(ratingInfo);
      if (foundRating) {
        // we have come across a rating that we already have in the db
        // so we don't need to continue processing this page
        break;
      }
      const newRating = FilmEntriesRepo.create(ratingInfo);

      const saved = await FilmEntriesRepo.save(newRating);
      syncedForPage.push(saved);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullMessage = `Error while syncing ratings for Letterboxd user ${username} for user ID ${userId}: ${errorMessage}`;
      console.log(fullMessage)
      throw new SyncLetterboxdError(fullMessage);
    }
  }

  return syncedForPage;
}

interface SyncAllEntriesOptions {
  userId: number;
  username?: string;
  order?: "ASC" | "DESC";
}

export async function syncAllEntriesForUser({ userId, username, order = "ASC" }: SyncAllEntriesOptions) {
  let syncedWatches: FilmEntry[] = [];
  let syncedRatings: FilmEntry[] = [];
  
  const UsersRepo = await getUserRepository();

  if (!username) {
    const user = await UsersRepo.findOneBy({ 
      id: userId
    });

    if (!user) {
      throw new SyncLetterboxdError('User does not exist', { synced: [] });
    }

    username = user.username;
  }

  const lastWatchesPage = await findLastWatchesPage(username);

  try {
    if (order === "DESC") {
      for (let page = lastWatchesPage; page > 0; page--) {
        const syncedForPage = await syncWatchesForPage({
          userId,
          username,
          page
        });
        syncedWatches = syncedWatches.concat(syncedForPage);
      }
    } else if (order === "ASC") {
      for (let page = 0; page <= lastWatchesPage; page++) {
        const syncedForPage = await syncWatchesForPage({
          userId,
          username,
          page
        });
        // if (syncedForPage.length === 0) {
        //   // when moving through the pages forward, as soon
        //   // as we encounter a page with no ratings, we can
        //   // assume we don't need to continue through pages
        //   break;
        // }
        syncedWatches = syncedWatches.concat(syncedForPage);
      }
    }
  } catch (error) {
    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    if (typeof error === "string") {
      message = error;
    }
    throw new SyncLetterboxdError(message, { synced: syncedWatches, username });
  }

  const lastRatingsPage = await findLastRatingsPage(username);

  try {
    if (order === "DESC") {
      for (let page = lastRatingsPage; page > 0; page--) {
        const syncedForPage = await syncRatingsForPage({
          userId,
          username,
          page
        });
        syncedRatings = syncedRatings.concat(syncedForPage);
      }
    } else if (order === "ASC") {
      for (let page = 0; page <= lastRatingsPage; page++) {
        const syncedForPage = await syncRatingsForPage({
          userId,
          username,
          page
        });
        if (syncedForPage.length === 0) {
          // when moving through the pages forward, as soon
          // as we encounter a page with no ratings, we can
          // assume we don't need to continue through pages
          break;
        }
        syncedRatings = syncedRatings.concat(syncedForPage);
      }
    }
  } catch (error) {
    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    if (typeof error === "string") {
      message = error;
    }
    throw new SyncLetterboxdError(message, { synced: syncedRatings, username });
  }

  const synced: {
    ratings: FilmEntry[];
    watches: FilmEntry[];
  } = {
    ratings: syncedRatings,
    watches: syncedWatches
  };

  return { synced, username };
}