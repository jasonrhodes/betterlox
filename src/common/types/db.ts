import { TmdbCast } from "../../lib/tmdb";
import { Movie, Rating, User } from "../../db/entities";

export type UserPublic = Omit<User, "password" | "salt" | "hashUserPassword" | "checkPassword"> & {
  isAdmin?: boolean;
};
export type RatedMovie = Movie & Pick<Rating, "stars" | "year">;
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
  USER_RATINGS = "User:Ratings",
  RATINGS_MOVIES = "Ratings:Movies",
  MOVIES_CAST = "Movies:Cast",
  MOVIES_CREW = "Movies:Crew",
  MOVIES_CREDITS = "Movies:Credits"
}

export enum SyncTrigger {
  SYSTEM = "system",
  USER = "user"
}