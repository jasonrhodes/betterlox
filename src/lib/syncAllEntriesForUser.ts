import { FilmEntry } from "../db/entities";
import { getFilmEntriesRepository, getUserRepository } from "../db/repositories";
import { 
  findLastDiaryPage, 
  findLastWatchesPage,
  scrapeDiaryEntriesByPage,
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
  direction?: 'down' | 'up';
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
        continue;
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

async function syncDiaryEntriesForPage({ userId, username, page, direction = 'down' }: SyncPageOptions) {
  const FilmEntriesRepo = await getFilmEntriesRepository();
  const { diaryEntries } = await scrapeDiaryEntriesByPage({ username, page, direction });
  if (diaryEntries.length === 0) {
    return [];
  }

  const syncedForPage: FilmEntry[] = [];

  for (let i = 0; i <= diaryEntries.length; i++) {
    const diaryEntry = diaryEntries[i];
    if (!diaryEntry) {
      break;
    }

    const {
      movieId,
      name,
      stars,
      date,
      heart,
      rewatch,
      letterboxdSlug
    } = diaryEntry;

    if (typeof movieId !== "number") {
      throw new Error('Invalid TMDB ID');
    }

    if (typeof stars !== "number" && typeof stars !== "undefined") {
      throw new Error(`Invalid star rating ${typeof stars} ${stars}`);
    }

    if (!(date instanceof Date) && typeof date !== "undefined") {
      throw new Error(`Invalid date ${typeof date} ${date}`);
    }

    if (typeof name !== "string" && typeof name !== "undefined") {
      throw new Error(`Invalid name ${name}`);
    }

    try {
      const entryInfo = {
        movieId,
        userId,
        stars,
        date,
        heart
      };
      const existingEntry = await FilmEntriesRepo.findOneBy(entryInfo);

      if (existingEntry) {
        // we have this entry in the database exactly the way we want it
        continue;
      }

      const entryToSave = FilmEntriesRepo.create(entryInfo)

      if (typeof name !== "undefined") {
        entryToSave.name = name;
      }
      if (typeof date !== "undefined") {
        entryToSave.date = date;
      }
      if (typeof stars !== "undefined") {
        entryToSave.stars = stars;
      }
      if (typeof letterboxdSlug !== "undefined") {
        entryToSave.letterboxdSlug = letterboxdSlug;
      }
      if (typeof heart !== "undefined") {
        entryToSave.heart = heart;
      }
      if (typeof rewatch !== "undefined") {
        entryToSave.rewatch = rewatch;
      }

      const upserted = await FilmEntriesRepo.upsert(entryToSave, { conflictPaths: ['movieId', 'userId'], skipUpdateIfNoValuesChanged: true });
      syncedForPage.push(entryToSave);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullMessage = `Error while syncing ratings for Letterboxd user ${username} (UID ${userId}): ${errorMessage}`;
      console.log(fullMessage, { name, movieId });
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
  let syncedDiaryEntries: FilmEntry[] = [];
  
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

  // const lastWatchesPage = await findLastWatchesPage(username);

  // try {
  //   if (order === "DESC") {
  //     for (let page = lastWatchesPage; page > 0; page--) {
        
  //       // TODO REMOVE 
  //       console.log(`Syncing ${username} watches DESC for page ${page}`);

  //       const syncedForPage = await syncWatchesForPage({
  //         userId,
  //         username,
  //         page
  //       });
  //       syncedWatches = syncedWatches.concat(syncedForPage);
  //     }
  //   } else if (order === "ASC") {
  //     for (let page = 0; page <= lastWatchesPage; page++) {

  //       // TODO REMOVE
  //       console.log(`syncing ${username} watches ASC for page ${page}`);

  //       const syncedForPage = await syncWatchesForPage({
  //         userId,
  //         username,
  //         page
  //       });

  //       if (syncedForPage.length === 0) {
  //         // when moving through the pages forward, as soon
  //         // as we encounter a page with no ratings, we can
  //         // assume we don't need to continue through pages
  //         break;
  //       }
  //       syncedWatches = syncedWatches.concat(syncedForPage);
  //     }
  //   }
  // } catch (error) {
  //   let message = "Unknown error occurred";
  //   if (error instanceof Error) {
  //     message = error.message;
  //   }
  //   if (typeof error === "string") {
  //     message = error;
  //   }
  //   throw new SyncLetterboxdError(message, { synced: syncedWatches, username });
  // }

  const lastDiaryPage = await findLastDiaryPage(username);

  try {
    if (order === "DESC") {
      for (let page = lastDiaryPage; page > 0; page--) {

        // TODO REMOVE
        console.log(`Syncing ${username} ratings DESC for page ${page}`);

        const syncedForPage = await syncDiaryEntriesForPage({
          userId,
          username,
          page,
          direction: 'up'
        });
        syncedDiaryEntries = syncedDiaryEntries.concat(syncedForPage);
      }
    } else if (order === "ASC") {
      for (let page = 0; page <= lastDiaryPage; page++) {

        // TODO REMOVE
        console.log(`Syncing ${username} ratings ASC for page ${page}`);

        const syncedForPage = await syncDiaryEntriesForPage({
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
        syncedDiaryEntries = syncedDiaryEntries.concat(syncedForPage);
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
    throw new SyncLetterboxdError(message, { synced: syncedDiaryEntries, username });
  }

  // set last synced date for this user
  await UsersRepo.setLastEntriesUpdated(userId);

  const synced: {
    diaries: FilmEntry[];
    watches: FilmEntry[];
  } = {
    diaries: syncedDiaryEntries,
    watches: syncedWatches
  };

  return { synced, username };
}