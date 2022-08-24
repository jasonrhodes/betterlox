import { Person, Movie, Sync, CastRole, CrewRole, Collection, UserSettings, FilmEntry } from "../../db/entities";
import { TmdbConfigurationResponse, TmdbEnhancedCollection, TmdbPersonWithMovieCredits } from "../../lib/tmdb";
import { CREW_JOB_MAP } from "../constants";
import { RatedMovie, RatedTmdbCast } from "./db";

export type OrderDirection = "ASC" | "DESC";
export type ImageConfig = TmdbConfigurationResponse["images"];

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
  type: 'ratings_movies';
  synced: Array<Movie | null>;
}

export interface SyncMoviesPeopleResponse extends ApiSuccessResponse {
  type: 'movies_people' | 'movies_cast' | 'movies_crew';
  synced: Array<Person | null>;
}

export interface SyncMoviesCreditsResponse extends ApiSuccessResponse {
  type: 'movies_credits';
  synced: { cast: CastRole[], crew: CrewRole[], length: number }
}

export interface SyncAllMovieCollectionsResponse extends ApiSuccessResponse {
  type: 'movies_collections';
  synced: Movie[];
  count: number;
}

export interface SyncNone {
  success: boolean;
  type: 'none';
  synced: undefined[];
  message?: string;
}

export type SyncResponse = SyncAllMovieCollectionsResponse | SyncRatingsMoviesResponse | SyncMoviesCreditsResponse | SyncMoviesPeopleResponse | SyncNone | ApiErrorResponse;

export interface GlobalFilters {
  title?: string;
  collections?: number[];
  writers?: number[];
  directors?: number[];
  editors?: number[];
  actors?: number[];
  releaseDateRange?: string | null;
  genres?: string[];
  excludedGenres?: string[];
  onlyWomen?: boolean;
  onlyNonBinary?: boolean;
  allGenres?: boolean;
}

export interface SyncsManagementGetResponse {
  success: true,
  syncs: Sync[]
}

export interface UnsyncedGetResponse {
  success: true;
  unsynced: Movie[] | Person[] | CastRole[] | CrewRole[];
}

export interface UserRatingsSyncApiResponse extends ApiSuccessResponse {
  synced: {
    ratings: FilmEntry[];
    watches: FilmEntry[];
  };
  count: number;
}

export interface PeopleApiResponse extends ApiSuccessResponse {
  people: Person[];
}

export interface CollectionsApiResponse extends ApiSuccessResponse {
  collections: Pick<Collection, 'id' | 'name'>[];
}

export type SearchCollection = Pick<Collection, 'id' | 'name'>;
export type SearchApiResults = Person[] | SearchCollection[];

export interface SearchApiResponse<T extends SearchApiResults = SearchApiResults> extends ApiSuccessResponse {
  results: T;
}

export interface SyncOneMovieCredits extends ApiSuccessResponse {
  movie: Movie;
  syncedCredits: {
    crew: CrewRole[],
    cast: CastRole[]
  }
}

export interface SyncOneMovieCollections extends ApiSuccessResponse {
  movie: Movie;
  syncedCollections: Collection[];
}

export interface TmdbPersonByIdResponse extends ApiSuccessResponse {
  person: TmdbPersonWithMovieCredits
}

export interface TmdbCollectionByIdResponse extends ApiSuccessResponse {
  collection: TmdbEnhancedCollection 
}

export interface PersonStats extends Person {
  averageRating: number;
  countRated: number;
}

export interface UserStatsResponse extends ApiSuccessResponse {
  stats: PersonStats[] | Collection[];
}

export type OtherStatsType = "collections";
export type PeopleStatsType = "actors" | keyof typeof CREW_JOB_MAP;
export type AllStatsType = OtherStatsType | PeopleStatsType;
export type StatMode = 'favorite' | 'most';

export interface UpdateUserSettingsResponse extends ApiSuccessResponse {
  settings: UserSettings | undefined;
}

