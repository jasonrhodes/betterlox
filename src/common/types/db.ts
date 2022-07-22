import { TmdbCast } from "../../lib/tmdb";
import { Movie, Rating, User } from "../../db/entities";

export type UserPublic = Omit<User, "password" | "salt" | "prepareUser">;
export type RatedMovie = Movie & Pick<Rating, "stars" | "year">;
export type RatedTmdbCast = TmdbCast & { rating?: number };