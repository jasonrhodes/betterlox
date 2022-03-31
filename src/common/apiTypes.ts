import { TmdbConfigurationResponse, TmdbCast, TmdbCredits } from "../server/lib/tmdb";
import { Person, RatedMovie, RatedTmdbCast } from "../common/models";

export type OrderDirection = "ASC" | "DESC";
export type ImageConfig = TmdbConfigurationResponse["images"];

export interface RatingResult {
  rating: number;
  date: string;
  year: number;
  title: string;
  poster_path: string;
}

export interface ActorResult extends Partial<Person> {
  count: number;
  avg_rating: number;
  avg_cast_order: number;
}

export interface UserQueryOptions {
  userId: number;
}

// get ratings for user
export interface GetRatingsForUserOptions extends UserQueryOptions {
}

export interface GetRatingsForUserResponse {
  ratings: RatingResult[],
  image_config: ImageConfig
}

// get actors for user
export interface GetActorsForUserOptions extends UserQueryOptions {
  orderBy?: keyof ActorResult;
  order?: OrderDirection;
  castOrderThreshold?: number;
}

export interface GetActorsForUserResponse {
  actors: ActorResult[];
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