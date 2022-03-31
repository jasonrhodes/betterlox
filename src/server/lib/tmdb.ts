import { MovieDb } from "moviedb-promise";
import {
  MovieResponse,
  Person,
  Cast,
  Crew,
  CreditsResponse,
  ConfigurationResponse
} from "moviedb-promise/dist/request-types";

const { TMDB_API_KEY } = process.env;

if (!TMDB_API_KEY) {
  throw new Error("TMDB API key required to be set using TMDB_API_KEY=yourkey");
}

export const tmdb = new MovieDb(TMDB_API_KEY);

export type TmdbMovie = MovieResponse;
export type TmdbPerson = Person;
export type TmdbCast = Cast;
export type TmdbCrew = Crew;
export type TmdbCredits = CreditsResponse;
export type TmdbConfigurationResponse = ConfigurationResponse;