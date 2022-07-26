import axios from "axios";
import { MovieDb } from "moviedb-promise";
import {
  MovieResponse,
  Person,
  Cast,
  Crew,
  CreditsResponse,
  ConfigurationResponse
} from "moviedb-promise/dist/request-types";

import {
  Genre,
  ProductionCompany
} from "moviedb-promise/dist/types";

const { TMDB_API_KEY } = process.env;

if (!TMDB_API_KEY) {
  throw new Error("TMDB API key required to be set using TMDB_API_KEY=yourkey");
}

export const tmdb = new MovieDb(TMDB_API_KEY);

export async function getMovieInfoSafely(id: number): Promise<null | TmdbMovie> {
  if (id === 0) {
    return null;
  }

  try {
    return await tmdb.movieInfo(id);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      try {
        const tv = await tmdb.tvInfo(id);
        console.log(`${tv.name} appears to be a TV show and not a movie, ignoring and moving on`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log(
            `The requested resource could not be found in the TMDB API, for id: ${id} - ignoring this error and moving on`
          );
          console.log(error);
        } else {
          throw error;
        }
      }
      return null;
    } else {
      throw error;
    }
  }
}

export type TmdbMovie = MovieResponse;
export type TmdbPerson = Person;
export type TmdbCast = Cast;
export type TmdbCrew = Crew;
export type TmdbCredits = CreditsResponse;
export type TmdbConfigurationResponse = ConfigurationResponse;
export type TmdbGenre = Genre;
export type TmdbProductionCompany = ProductionCompany;