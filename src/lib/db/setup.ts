import Database, { SqliteError } from "better-sqlite3";
const db = new Database("./.db/movies.db");

/**
 * NOTE: These are mostly entities from the TMDB API, stored locally
 * to avoid rate-limiting and latency issues.
 *
 * For poster_path, backdrop_path, and other image paths, append paths
 * to base url + size, see: https://developers.themoviedb.org/3/getting-started/images
 *
 */

async function createTable(
  name: string,
  columns: string[],
  regenerate?: string[]
) {
  if (regenerate && (regenerate.includes("all") || regenerate.includes(name))) {
    const statement = db.prepare(`DROP TABLE IF EXISTS ${name}`);
    await statement.run();
  }
  const createQuery = `
  CREATE TABLE IF NOT EXISTS ${name} (
    ${columns.join(",\n")}
  )
  `;

  try {
    const statement = db.prepare(createQuery);
    await statement.run();
  } catch (error: unknown) {
    console.error(`Error while trying to create table ${name}`);
    console.log(createQuery);
    if (error instanceof SqliteError) {
      console.error(
        `SQLITE_ERROR | message: ${error.message}, code: ${error.code}, name: ${error.name}`
      );
    } else if (error instanceof Error) {
      console.error(`Message: ${error.message}`);
    }
    throw error;
  }
}

export interface SetupTableOptions {
  regenerate?: string[];
}

export async function setupTables({ regenerate }: SetupTableOptions = {}) {
  await createTable(
    "users",
    [
      "id int PRIMARY KEY",
      "username text NOT NULL UNIQUE",
      "letterboxd_id text UNIQUE",
    ],
    regenerate
  );

  await createTable(
    "ratings",
    [
      "user_id int NOT NULL",
      "movie_id int NOT NULL",
      "rating float NOT NULL",
      "date text",
      "name text",
      "year int",
      "PRIMARY KEY (user_id, movie_id)",
    ],
    regenerate
  );

  await createTable(
    "movies",
    [
      "backdrop_path varchar(255)",
      "id int PRIMARY KEY",
      "imdb_id int UNIQUE",
      "last_updated int NOT NULL", // UNIX timestamp we last updated this in our db
      "original_language varchar(255)",
      "original_title text",
      "overview text",
      "poster_path varchar(255)",
      "popularity float",
      "runtime int",
      "release_date text",
      "title text NOT NULL",
    ],
    regenerate
  );

  await createTable("genres", ["id int PRIMARY KEY", "name text"], regenerate);

  await createTable(
    "join_movies_genres",
    [
      "movie_id int NOT NULL",
      "genre_id int NOT NULL",
      "PRIMARY KEY (movie_id, genre_id)",
    ],
    regenerate
  );

  await createTable(
    "production_companies",
    [
      "id int PRIMARY KEY",
      "name text NOT NULL",
      "logo_path text",
      "origin_country text",
    ],
    regenerate
  );

  await createTable(
    "join_movies_production_companies",
    [
      "movie_id int NOT NULL",
      "production_company_id int NOT NULL",
      "PRIMARY KEY (movie_id, production_company_id)",
    ],
    regenerate
  );

  await createTable(
    "people",
    [
      "biography text",
      "birthday text",
      "deathday text",
      "gender int",
      "id int PRIMARY KEY",
      "imdb_id int UNIQUE",
      "known_for_department text",
      "last_updated int NOT NULL",
      "name text",
      "place_of_birth text",
      "popularity float",
      "profile_path text",
    ],
    regenerate
  );

  await createTable(
    "join_movies_cast",
    [
      "movie_id int",
      "person_id int",
      "cast_id int",
      "character text",
      "cast_order int",
      "credit_id text",
      "PRIMARY KEY (movie_id, person_id)",
    ],
    regenerate
  );

  await createTable("crew", ["id int PRIMARY KEY"], regenerate);

  await createTable(
    "join_movies_crew",
    [
      "movie_id int",
      "person_id int",
      "job text",
      "department text",
      "credit_id text",
      "PRIMARY KEY (movie_id, person_id)",
    ],
    regenerate
  );
}
