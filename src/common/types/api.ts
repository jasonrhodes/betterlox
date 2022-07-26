import { Rating, Person, Movie } from "../../db/entities";
import { TmdbConfigurationResponse } from "../../lib/tmdb";
import { RatedMovie, RatedTmdbCast } from "./db";

export type OrderDirection = "ASC" | "DESC";
export type ImageConfig = TmdbConfigurationResponse["images"];

export interface RatingResult {
  rating: number;
  date: string;
  year: number;
  title: string;
  poster_path: string;
}

export interface ActorTableResult {
  actorId: number;
  name: string;
  profilePath: string;
  countMoviesSeen: number;
  avgRating: number;
  avgCastOrder: number;
}

export interface UserQueryOptions {
  userId: number;
}

// get ratings for user
export interface GetRatingsForUserOptions extends UserQueryOptions {
}

export interface GetRatingsForUserResponse {
  ratings: Rating[],
  image_config: ImageConfig
}

// get actors for user
// export interface GetActorsForUserOptions extends UserQueryOptions {
//   orderBy?: keyof ActorResult;
//   order?: OrderDirection;
//   castOrderThreshold?: number;
// }

export interface GetActorsForUserResponse {
  actors: ActorTableResult[];
  image_config: ImageConfig;
};

export interface GetMoviesForActorAndUserOptions extends UserQueryOptions {
  actorId: number;
  castOrderThreshold?: number;
}

export interface GetMoviesForActorAndUserResponse {
  image_config: ImageConfig;
  actor: Person;
  ratings: RatedMovie[];
  avg_rating: number;
  cast_credits: RatedTmdbCast[];
}

export interface ApiSuccessResponse {
  success: true;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  code: number;
  message: string;
}

export interface SyncRatingsMoviesResponse extends ApiSuccessResponse {
  missingMovies: number[];
  synced: Array<Movie | null>;
}

export interface SyncMoviesPeopleResponse extends ApiSuccessResponse {
  missingPeople: number[];
  synced: Array<Person | null>;
}

export interface SyncNone extends ApiSuccessResponse {
  synced: undefined[];
  message: string;
}

export type SyncResponse = SyncRatingsMoviesResponse | SyncMoviesPeopleResponse | SyncNone | ApiErrorResponse;