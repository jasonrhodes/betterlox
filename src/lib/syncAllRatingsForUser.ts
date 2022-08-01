import { Rating } from "../db/entities";
import { getRatingsRepository, getUserRepository } from "../db/repositories";
import { findLastRatingsPage, scrapeRatingsByPage } from "./letterboxd";

export class SyncRatingsError extends Error {
  synced?: Rating[];
  username?: string;

  constructor(message: string, { synced, username }: { synced?: Rating[]; username?: string; } = {}) {
    super(message);
    this.username = username;
    this.synced = synced;
  }
}

interface SyncRatingsPageOptions {
  userId: number;
  username: string;
  page: number;
}

async function syncRatingsForPage({ userId, username, page }: SyncRatingsPageOptions) {
  const RatingsRepo = await getRatingsRepository();
  const { ratings } = await scrapeRatingsByPage({ username, page });
    if (ratings.length === 0) {
      return [];
    }

    const syncedForPage: Rating[] = [];

    for (let i = 0; i <= ratings.length; i++) {
      const rating = await ratings[i];
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
        const foundRating = await RatingsRepo.findOneBy(ratingInfo);
        if (foundRating) {
          // we have come across a rating that we already have in the db
          // so we don't need to continue processing this page
          break;
        }
        const newRating = RatingsRepo.create(ratingInfo);

        const saved = await RatingsRepo.save(newRating);
        syncedForPage.push(saved);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const fullMessage = `Error while syncing ratings for Letterboxd user ${username} for user ID ${userId}: ${errorMessage}`;
        console.log(fullMessage)
        throw new SyncRatingsError(fullMessage);
      }
    }

    return syncedForPage;
}

interface SyncAllRatingsOptions {
  userId: number;
  username?: string;
  order?: "ASC" | "DESC";
}

export async function syncAllRatingsForUser({ userId, username, order = "ASC" }: SyncAllRatingsOptions) {
  let synced: Rating[] = [];
  
  const UsersRepo = await getUserRepository();

  if (!username) {
    const user = await UsersRepo.findOneBy({ 
      id: userId
    });

    if (!user) {
      throw new SyncRatingsError('User does not exist', { synced });
    }

    username = user.username;
  }

  const lastPage = await findLastRatingsPage(username);

  try {
    if (order === "DESC") {
      for (let page = lastPage; page > 0; page--) {
        const syncedForPage = await syncRatingsForPage({
          userId,
          username,
          page
        });
        synced = synced.concat(syncedForPage);
      }
    } else if (order === "ASC") {
      for (let page = 0; page <= lastPage; page++) {
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
        synced = synced.concat(syncedForPage);
      }
    }
    
    return { synced, username };
  } catch (error) {
    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    if (typeof error === "string") {
      message = error;
    }
    throw new SyncRatingsError(message, { synced, username });
  }
}