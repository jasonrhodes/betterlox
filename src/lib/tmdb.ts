import axios from "axios";
import { MovieDb } from "moviedb-promise";
import {
  MovieResponse,
  Person,
  Cast,
  Crew,
  CreditsResponse,
  ConfigurationResponse,
  CollectionInfoResponse
} from "moviedb-promise/dist/request-types";

import {
  Genre,
  ProductionCompany
} from "moviedb-promise/dist/types";

if (typeof process.env.TMDB_API_KEY === "undefined") {
  throw new Error("TMDB API key required to be set using TMDB_API_KEY=yourkey");
}

export const tmdb = new MovieDb(process.env.TMDB_API_KEY);

export async function getMovieInfoSafely(id: number): Promise<null | TmdbMovie> {
  if (id === 0) {
    return null;
  }

  try {
    return await tmdb.movieInfo(id);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log(
          `The requested resource (Movie ID: ${id}) could not be found in the TMDB API (ignoring this error and moving on)`
        );
      } else {
        console.log(`TMDB API error while fetching movie ID ${id} | ${error.response?.status} | ${error.cause} | ${error.message}}`);
      }
      return null;
    } else {
      throw error;
    }
  }
}

export type TmdbMovie = MovieResponse;
export type TmdbPerson = Person;
export type TmdbPersonWithMovieCredits = Person & {
  movie_credits: {
    cast: Array<Cast & Partial<MovieResponse>>;
    crew: Array<Crew & Partial<MovieResponse>>;
  };
};
export type TmdbCast = Cast;
export type TmdbCrew = Crew;
export type TmdbCredits = CreditsResponse;
export type TmdbConfigurationResponse = ConfigurationResponse;
export type TmdbGenre = Genre;
export type TmdbProductionCompany = ProductionCompany;
export type TmdbCollection = CollectionInfoResponse;

type CollectionMovieParts = Required<CollectionInfoResponse>['parts'];
type CollectionMovie = CollectionMovieParts[number];
type EnhancedCollectionMovie = CollectionMovie & {
  imdb_id: string;
};

export interface TmdbEnhancedCollection extends CollectionInfoResponse {
  parts: EnhancedCollectionMovie[];
}