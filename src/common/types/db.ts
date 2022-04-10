import { TmdbCast } from "../../lib/tmdb";
import { LetterboxdAccountLevel } from "./base";

export interface Person {
  biography: string;
  birthday: string;
  deathday: string;
  gender: number;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  original_name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
  last_updated: number;
}

export interface Movie {
  backdrop_path: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  poster_path: string;
  popularity: number;
  runtime: number;
  release_date: string;
  title: string;
  last_updated: number;
}

export interface Rating {
  user_id: number;
  movie_id: number;
  rating: number;
  date?: string;
  name?: string;
  year?: number;
}

export interface DBUser {
  id: number;
  email: string;
  password: string;
  salt: string;
  avatarUrl: string;
  letterboxdUsername: string;
  letterboxdName: string;
  letterboxdAccountLevel: LetterboxdAccountLevel;
  rememberMeToken?: string | null;
}

export type UserPublic = Omit<DBUser, "password" | "salt">;

export type RatedMovie = Movie & Pick<Rating, "rating" | "year">;

export type RatedTmdbCast = TmdbCast & { rating?: number };