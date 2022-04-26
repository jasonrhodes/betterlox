/**
 * TODO: This file should be broken into models and moved
 * into models/{model-file} to keep things organized
 * 
 */
import { setupTables, SetupTableOptions } from "./setup";
import { TmdbMovie, TmdbPerson } from "../tmdb";

import {
  ActorResult,
  GetActorsForUserOptions,
  GetMoviesForActorAndUserOptions,
  GetRatingsForUserOptions,
  RatingResult
} from "../../common/types/api";
import { Person, Movie, RatedMovie } from "../../common/types/db";
import { getDBClient } from "./adapter";

const config = { path: "./.db/movies.db" };
export const db = getDBClient("sqlite", config);

type Optional<T> = T | undefined | null;

interface InitializeOptions {
  tables?: SetupTableOptions;
}

export async function initialize(options: InitializeOptions = {}) {
  await setupTables(options.tables);
}

export async function getMovie(movieId: number) {
  const stmt = db.prepare<[number], Movie>(`
    SELECT * FROM movies
    WHERE id = ?
  `);
  return stmt.get(movieId);
}

export async function upsertMovie(movie: TmdbMovie) {
  if (!movie.id) {
    throw new Error(`Missing movie ID`);
  }
  const now = new Date();
  const nowTs = now.getTime();

  const stmt = db.prepare<
    [
      number,
      number,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<number>,
      Optional<number>,
      Optional<string>,
      Optional<string>
    ]
  >(`
    REPLACE INTO movies (
      id,
      last_updated,
      backdrop_path,
      imdb_id,
      original_language,
      original_title,
      overview,
      poster_path,
      popularity,
      runtime,
      release_date,
      title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    movie.id,
    nowTs,
    movie.backdrop_path,
    movie.imdb_id,
    movie.original_language,
    movie.original_title,
    movie.overview,
    movie.poster_path,
    movie.popularity,
    movie.runtime,
    movie.release_date,
    movie.title
  );
}

export async function getPerson(personId: number) {
  const stmt = db.prepare<[number], Person>(`
    SELECT * FROM people
    WHERE id = ?
  `);
  return stmt.get(personId);
}

export async function upsertPerson(person: TmdbPerson) {
  return insertPerson(person, { replace: true });
}

export async function insertPerson(
  person: TmdbPerson,
  { replace }: { replace?: boolean } = {}
) {
  if (!person.id) {
    throw new Error("Missing person ID");
  }

  const now = new Date();
  const nowTs = now.getTime();

  const writeAction = replace ? "REPLACE" : "INSERT";

  const stmt = db.prepare<
    [
      number,
      number,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<number>,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<string>,
      Optional<number>,
      Optional<string>
    ]
  >(`
    ${writeAction} INTO people (
      id,
      last_updated,
      biography,
      birthday,
      deathday,
      gender,
      imdb_id,
      known_for_department,
      name,
      place_of_birth,
      popularity,
      profile_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    person.id,
    nowTs,
    person.biography,
    person.birthday,
    person.deathday,
    person.gender,
    person.imdb_id || null,
    person.known_for_department,
    person.name,
    person.place_of_birth,
    person.popularity,
    person.profile_path
  );
}

export async function addGenre(id: number, name: string) {
  const stmt = db.prepare<[number, string]>(`
    REPLACE INTO genres (id, name) VALUES (?, ?)
  `);

  return stmt.run(id, name);
}

export async function addProductionCompany(
  id: number,
  name: string,
  logo_path: string,
  origin: string
) {
  const stmt = db.prepare<[number, string, string, string]>(`
    REPLACE INTO production_companies (
      id,
      name,
      logo_path,
      origin_country
    ) VALUES (?, ?, ?, ?)
  `);

  return stmt.run(id, name, logo_path, origin);
}

export async function addRating(
  userId: number,
  movieId: number,
  rating: number,
  date: string,
  name: string,
  year?: number
) {
  const stmt = db.prepare<[number, number, number, string, string]>(`
    INSERT INTO ratings (
      user_id,
      movie_id,
      rating,
      date,
      name
    ) VALUES (?, ?, ?, ?, ?)
  `);

  return stmt.run(userId, movieId, rating, date, name);
}

export async function addCastMemberToMovie(
  movieId: number,
  personId: number,
  castId: Optional<number>,
  character: Optional<string>,
  castOrder: Optional<number>,
  creditId: Optional<string>
) {
  const stmt = db.prepare<
    [
      number,
      number,
      Optional<number>,
      Optional<string>,
      Optional<number>,
      Optional<string>
    ]
  >(`
    REPLACE INTO join_movies_cast (
      movie_id,
      person_id,
      cast_id,
      character,
      cast_order,
      credit_id
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(movieId, personId, castId, character, castOrder, creditId);
}

export async function addCrewMemberToMovie(
  movieId: number,
  personId: number,
  job: Optional<string>,
  department: Optional<string>,
  creditId: Optional<string>
) {
  const stmt = db.prepare<
    [number, number, Optional<string>, Optional<string>, Optional<string>]
  >(`
    REPLACE INTO join_movies_crew (
      movie_id,
      person_id,
      job,
      department,
      credit_id
    ) VALUES (?, ?, ?, ?, ?)
  `);

  return stmt.run(movieId, personId, job, department, creditId);
}

export async function addGenreToMovie(movieId: number, genreId: number) {
  const stmt = db.prepare<[number, number]>(`
    REPLACE INTO join_movies_genres (movie_id, genre_id) VALUES (?, ?)
  `);

  return stmt.run(movieId, genreId);
}

export async function addProductionCompanyToMovie(
  movieId: number,
  productionCompanyId: number
) {
  const stmt = db.prepare<[number, number]>(`
    REPLACE INTO join_movies_production_companies (
      movie_id,
      production_company_id
    ) VALUES (?, ?)
  `);

  return stmt.run(movieId, productionCompanyId);
}

interface FindMissingPeopleOptions {
  limit?: number;
}

interface FindMissingPersonResult {
  person_id: number;
}

export async function findMissingCastMembers({
  limit,
}: FindMissingPeopleOptions = {}) {
  const stmt = db.prepare<never, FindMissingPersonResult>(`
    SELECT DISTINCT(join_movies_cast.person_id)
    FROM join_movies_cast
    LEFT JOIN people
    ON join_movies_cast.person_id = people.id
    WHERE people.id IS NULL
    ${limit ? `LIMIT ${limit}` : ''}
  `);

  const result = await stmt.all();
  return result.map(({ person_id }) => person_id);
}

export async function findMissingCrewMembers({
  limit,
}: FindMissingPeopleOptions = {}) {
  let stmt = db.prepare<never, FindMissingPersonResult>(`
    SELECT DISTINCT(join_movies_crew.person_id)
    FROM join_movies_crew
    LEFT JOIN people
    ON join_movies_crew.person_id = people.id
    WHERE people.id IS NULL
    ${limit ? `LIMIT ${limit}` : ''}
  `);

  const result = await stmt.all();
  return result.map(({ person_id }) => person_id);
}

export async function getRatingsForUser({
  userId
}: GetRatingsForUserOptions) {

  const stmt = db.prepare<[number], RatingResult>(`
    SELECT ratings.rating, ratings.date, ratings.year, movies.title, movies.poster_path
    FROM ratings
    INNER JOIN movies
    ON ratings.movie_id = movies.id
    WHERE user_id = ?
    ORDER BY date DESC;
  `);

  return stmt.all(userId);
}

export async function getActorsForUser({
  userId,
  orderBy = "count",
  order = "DESC",
  castOrderThreshold = 15
}: GetActorsForUserOptions) {
  // NOTE: if you add/remove selected values here, they should map to type ActorResult
  const stmt = db.prepare<[number, number], ActorResult>(`
    SELECT p.id, p.name, COUNT(m.title) AS count, AVG(r.rating) AS avg_rating, AVG(jmc.cast_order) as avg_cast_order, p.known_for_department, p.popularity, p.profile_path
    FROM movies AS m
    INNER JOIN ratings AS r
    ON m.id = r.movie_id
    INNER JOIN join_movies_cast as jmc
    ON m.id = jmc.movie_id
    INNER JOIN people AS p
    ON jmc.person_id = p.id
    WHERE r.user_id = ?
    AND jmc.cast_order <= ?
    GROUP BY jmc.person_id
    ORDER BY ${orderBy} ${order};
  `);

  return stmt.all(userId, castOrderThreshold);
}

export async function getMoviesForActorAndUser({
  userId,
  actorId,
  castOrderThreshold = 15
}: GetMoviesForActorAndUserOptions) {

  const stmt = db.prepare<[number, number, number], RatedMovie>(`
    SELECT movies.*, ratings.rating, ratings.year
    FROM movies
    INNER JOIN ratings
    ON movies.id = ratings.movie_id
    INNER JOIN join_movies_cast AS jmc
    ON movies.id = jmc.movie_id
    WHERE ratings.user_id = ?
    AND jmc.person_id = ?
    AND jmc.cast_order <= ?
    ORDER BY release_date ASC;
  `);

  return stmt.all(userId, actorId, castOrderThreshold);
}

export async function getAverageRatingForActor({
  userId,
  actorId,
  castOrderThreshold = 15
}: GetMoviesForActorAndUserOptions) {
  const stmt = db.prepare<[number, number, number], { avg_rating: number }>(`
    SELECT AVG(ratings.rating) as avg_rating
    FROM ratings
    INNER JOIN movies
    ON movies.id = ratings.movie_id
    INNER JOIN join_movies_cast AS jmc
    ON movies.id = jmc.movie_id
    WHERE ratings.user_id = ?
    AND jmc.person_id = ?
    AND jmc.cast_order <= ?;
  `);

  return stmt.get(userId, actorId, castOrderThreshold);
}