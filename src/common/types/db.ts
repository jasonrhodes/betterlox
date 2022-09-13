import { TmdbCast } from "../../lib/tmdb";
import { Movie, User, FilmEntry } from "../../db/entities";

export type UserResponse = Omit<User, "password" | "salt" | "hashUserPassword" | "checkPassword"> & {
  isAdmin?: boolean;
};
export type UserPublicSafe = Omit<UserResponse, "rememberMeToken">;
export type UserPublic = UserResponse | UserPublicSafe;

export type RatedMovie = Movie & Pick<FilmEntry, "stars">;
export type RatedTmdbCast = TmdbCast & { rating?: number };

export enum SyncStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  COMPLETE = "Complete",
  SKIPPED = "Skipped",
  FAILED = "Failed"
}

export enum SyncType {
  UNKNOWN = "Unknown",
  NONE = "None",
  USER_RATINGS = "User:Ratings",
  USER_LISTS = "User:Lists",
  RATINGS_MOVIES = "Ratings:Movies",
  MOVIES_CAST = "Movies:Cast",
  MOVIES_CREW = "Movies:Crew",
  MOVIES_CREDITS = "Movies:Credits",
  MOVIES_COLLECTIONS = "Movies:Collections",
  POPULAR_MOVIES_YEAR = "Popular_Movies:By_Year",
  POPULAR_MOVIES_GENRE = "Popular_Movies:By_Genre",
  POPULAR_MOVIES_MOVIES = "Popular_Movies:Movies",
  DEPRECATED_MOVIES = "Movies"
}

export enum SyncTrigger {
  SYSTEM = "system",
  USER = "user"
}

export type TypeOrmEntityMethods = 'hasId' | 'remove' | 'save' | 'softRemove' | 'recover' | 'reload';