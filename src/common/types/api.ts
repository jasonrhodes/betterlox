import { ApiError } from "next/dist/server/api-utils";
import { InsertResult } from "typeorm";
import { Person, Movie, Sync, CastRole, CrewRole, Collection, UserSettings, FilmEntry, LetterboxdList } from "../../db/entities";
import { TmdbConfigurationResponse, TmdbEnhancedCollection, TmdbPersonWithMovieCredits } from "../../lib/tmdb";
import { CREW_JOB_MAP } from "../constants";
import { RatedMovie, RatedTmdbCast, TypeOrmEntityMethods, UserPublicSafe } from "./db";

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

export interface SyncEntriesMoviesResponse extends ApiSuccessResponse {
  type: 'entries_movies';
  synced: Array<InsertResult | null>;
}

export interface SyncPopularMoviesResponse extends ApiSuccessResponse {
  type: 'popular_movies_per_year' | 'popular_movies_per_genre' | 'popular_movies_movies';
  syncedCount: number;
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

export type SyncResponse = SyncPopularMoviesResponse | SyncAllMovieCollectionsResponse | SyncEntriesMoviesResponse | SyncMoviesCreditsResponse | SyncMoviesPeopleResponse | SyncNone | ApiErrorResponse;

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

export interface SyncManagementGetOneResponse extends ApiSuccessResponse {
  sync: Sync;
}

export type SyncManagementApiResponse = SyncManagementGetOneResponse | ApiSuccessResponse | ApiErrorResponse;

export interface UnsyncedGetResponse {
  success: true;
  unsynced: Movie[] | Person[] | CastRole[] | CrewRole[];
}

export interface UserEntriesSyncApiResponse extends ApiSuccessResponse {
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

export interface EntryQueryResult {
  entry_letterboxdSlug: string;
  entry_movieId: number;
  entry_name: string;
  entry_unsyncable: false;
  entry_userId: number;
  entry_stars?: number;
  entry_dateRated?: Date;
  movie_id: number;
  movie_backdropPath: string;
  movie_imdbId: string;
  movie_originalLanguage: string;
  movie_originalTitle: string;
  movie_posterPath: string;
  movie_popularity: number;
  movie_runtime: number;
  movie_releaseDate: string;
  movie_letterboxdSlug: string;
  movie_title: string;
  movie_genres: string[];
  movie_tagline: string;
}

export type EntryMovie = Omit<Movie, 'overview' | 'syncedCredits' | 'syncedProductionCompanies' | 'syncedCollections' | 'productionCompanies' | 'productionCountries' | 'cast' | 'crew' | 'collections' | 'status' | 'entries' | TypeOrmEntityMethods>;
export type EntryApiResponse = Omit<FilmEntry, 'user' | 'movie'> & { movie: EntryMovie };

export interface EntriesApiResponse extends ApiSuccessResponse {
  entries: EntryApiResponse[];
}

export interface UserApiSuccessResponse extends ApiSuccessResponse {
  user: UserPublicSafe | null;
}

export type UserApiResponse = UserApiSuccessResponse | ApiErrorResponse;

export interface UsersApiSuccessResponse extends ApiSuccessResponse {
  users: UserPublicSafe[];
}

export type UsersApiResponse = UsersApiSuccessResponse | ApiErrorResponse;

interface MoviesApiFindResponse extends ApiSuccessResponse {
  movies: Movie[];
}

export type MoviesApiResponse = MoviesApiFindResponse | ApiSuccessResponse | ApiErrorResponse;

export interface LetterboxdListsManagementGetResponse extends ApiSuccessResponse {
  totalCount: number;
  lists: LetterboxdList[];
}

interface LetterboxdListsManagementPostResponse extends ApiSuccessResponse {
  list: Partial<LetterboxdList>;
}

export type LetterboxdListsManagementApiResponse = ApiResponse<LetterboxdListsManagementGetResponse | LetterboxdListsManagementPostResponse>;


export interface LetterboxdListsForUserGetResponse extends ApiSuccessResponse {
  totalCount: number;
  lists: LetterboxdList[];
}

export interface ScrapedLetterboxdList {
  letterboxdListId: number;
  publishDate?: string;
  lastUpdated?: string;
  title: string;
  description?: string;
  username: string;
  url: string;
  movies: number[];
  isRanked: boolean;
  visibility: 'public' | 'private'
}
export interface LetterboxdListsForUserPostResponse extends ApiSuccessResponse {
  synced: number;
}

export type LetterboxdListsForUserApiResponse = ApiResponse<LetterboxdListsForUserGetResponse | LetterboxdListsForUserPostResponse>;

export type ApiResponse<T extends ApiSuccessResponse = ApiSuccessResponse> = T | ApiSuccessResponse | ApiErrorResponse;


export interface ListUserStats {
  watched: number;
  entries: FilmEntry[];
  movies: number;
}
export interface UserListStatsGetResponse extends ApiSuccessResponse {
  stats: ListUserStats;
}

export type UserListStatsApiResponse = ApiResponse<UserListStatsGetResponse>;

export interface UserListsPostResponse extends ApiSuccessResponse {
  synced: number;
}

export interface UserListsGetResponse extends ApiSuccessResponse {
  lists: LetterboxdList[];
}

export type UserListsApiResponse = ApiResponse<UserListsGetResponse | UserListsPostResponse>;
