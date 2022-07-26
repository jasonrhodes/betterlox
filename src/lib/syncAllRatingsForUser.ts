import { Rating } from "../db/entities";
import { getRatingsRepository, getUserRepository } from "../db/repositories";
import { findLastRatingsPage, scrapeRatingsByPage } from "./letterboxd";

export class SyncRatingsError extends Error {
  synced: Rating[];
  username?: string;

  constructor(message: string, { synced, username }: { synced: Rating[]; username?: string; }) {
    super(message);
    this.username = username;
    this.synced = synced;
  }
}

export async function syncAllRatingsForUser(userId: number, username?: string) {
  let synced: Rating[] = [];
  const RatingsRepo = await getRatingsRepository();
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
    for (let page = lastPage; page > 0; page--) {
      const { ratings } = await scrapeRatingsByPage({ username, page });
      if (ratings.length === 0) {
        break;
      }

      for (let i = 0; i <= ratings.length; i++) {
        const rating = await ratings[i];
        if (!rating) {
          break;
        }

        const {
          movieId,
          name,
          stars,
          date
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
          const newRating = RatingsRepo.create({
            movieId,
            userId,
            stars,
            date,
            name
          });

          const saved = await RatingsRepo.save(newRating);
          synced.push(saved);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          throw new SyncRatingsError(message, { synced })
        }
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