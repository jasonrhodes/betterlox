import { NextApiHandler } from "next";
import { TypeORMError } from "typeorm";
import { getRatingsRepository } from "../../../../db/repositories/RatingsRepo";
import { findLastRatingsPage, scrapeRatingsByPage } from "../../../../lib/letterboxd";
import { numericQueryParam } from "../../../../lib/queryParams";

const UserSyncRoute: NextApiHandler = async (req, res) => {
  const userId = numericQueryParam(req.query.userId);
  const { username } = req.body;
  if (typeof username !== "string") {
    throw new Error(`username must be a string, got ${typeof username}`);
  }

  const ratingsRepo = await getRatingsRepository();

  let synced = 0;
  let duplicates = 0;

  const lastPage = await findLastRatingsPage("rhodesjason");

  try {
    for (let page = lastPage; page > 0; page--) {
      const { ratings } = await scrapeRatingsByPage({ username, page });
      if (ratings.length === 0) {
        break;
      }

      console.log(`${ratings.length} ratings found on page ${page}`);

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
          const newRating = ratingsRepo.create({
            movieId,
            userId,
            stars,
            date,
            name
          });

          ratingsRepo.save(newRating);
          synced++;
        } catch (error: unknown) {
          if (error instanceof TypeORMError) {
            console.log('TYPEORM_ERROR', error.message);
            duplicates++;
            continue;
          } else {
            throw error;
          }
        }
      }
    }
    res.json({ synced, duplicates });
  } catch (error) {
    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    if (typeof error === "string") {
      message = error;
    }
    res.status(500).json({ message, synced, duplicates });
  }
}

interface SyncRatingsOptions {
  username: string;
  page: number;
}

function syncRatings({
  username,
  page
}: SyncRatingsOptions) {

}

export default UserSyncRoute;