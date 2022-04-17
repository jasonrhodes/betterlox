import { NextApiHandler } from "next";
import { addRating } from "../../../../lib/db/client";
import { scrapeRatings } from "../../../../lib/letterboxd";
import { numericQueryParam } from "../../../../lib/queryParams";
import { SqliteError } from "better-sqlite3";

const UserSyncRoute: NextApiHandler = async (req, res) => {
  const userId = numericQueryParam(req.query.userId);
  const { username } = req.body;
  if (typeof username !== "string") {
    throw new Error(`username must be a string, got ${typeof username}`);
  }
  try {
    let synced = 0;
    // if a user has more than 50K pages of ratings, sorry?
    for (let page = 1; page < 50000; page++) {
      const { ratings } = await scrapeRatings(username, page);
      if (ratings.length === 0) {
        break;
      }
      try {
        for (let i = 0; i <= ratings.length; i++) {
          const {
            movie_id,
            name,
            rating: star_rating,
            date
          } = await ratings[i];

          if (typeof movie_id !== "number") {
            throw new Error('Invalid TMDB ID');
          }

          if (typeof star_rating !== "number") {
            throw new Error(`Invalid star rating ${star_rating}`);
          }

          if (typeof date !== "string") {
            throw new Error(`Invalid date ${date}`);
          }

          if (typeof name !== "string") {
            throw new Error(`Invalid name ${name}`);
          }

          await addRating(
            userId,
            movie_id,
            star_rating,
            date,
            name
          );
        }
      } catch (error: unknown) {
        // stop processing once we reach the first review already in the db
        if (error instanceof SqliteError && error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
          break;
        }
        throw error;
      }
      synced = synced + ratings.length;
    }
    res.json({ synced });
  } catch (err) {
    res.status(500).json({ err });
  }
}

export default UserSyncRoute;