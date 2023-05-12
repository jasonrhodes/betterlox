import type { Person, Movie, Sync, CastRole, CrewRole, Collection, UserSettings, FilmEntry, LetterboxdList, LetterboxdUserEntrySync } from "@rhodesjason/loxdb/dist/db/entities";
import type { TmdbConfigurationResponse, TmdbEnhancedCollection, TmdbPersonWithMovieCredits } from "@rhodesjason/loxdb/dist/lib/tmdb";
import type { DBInsertResult, PersonStats, RatedMovie, RatedTmdbCast, SearchCollection, TypeOrmEntityMethods, UserPublicSafe } from "@rhodesjason/loxdb/dist/common/types/db";

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
  synced: Array<DBInsertResult | null>;
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

export interface SyncsForUserResponse extends ApiSuccessResponse {
  syncs: LetterboxdUserEntrySync[];
}

export interface UserEntriesSyncApiResponse extends ApiSuccessResponse {
  synced: {
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

export interface TmdbMovieByIdGetResponse extends ApiSuccessResponse {
  movie: {
    id: number;
    title?: string;
    posterPath?: string;
    releaseDate?: string;
  }
}

export type TmdbMovieByIdApiResponse = ApiResponse<TmdbMovieByIdGetResponse>;

export interface UserStatsResponse extends ApiSuccessResponse {
  stats: PersonStats[] | Collection[];
}

export interface UpdateUserSettingsResponse extends ApiSuccessResponse {
  settings: UserSettings | undefined;
}

export interface EntryQueryResult {
  entry_letterboxdSlug: FilmEntry['letterboxdSlug'];
  entry_movieId: FilmEntry['movieId'];
  entry_name: FilmEntry['name'];
  entry_unsyncable: FilmEntry['unsyncable'];
  entry_userId: FilmEntry['userId'];
  entry_stars: FilmEntry['stars'];
  entry_heart: FilmEntry['heart'];
  entry_rewatch: FilmEntry['rewatch'];
  entry_date: FilmEntry['date'];
  entry_dateRated?: Date;
  entry_sortId: FilmEntry['sortId'];
  movie_id: Movie['id'];
  movie_backdropPath: Movie['backdropPath'];
  movie_imdbId: Movie['imdbId'];
  movie_originalLanguage: Movie['originalLanguage'];
  movie_originalTitle: Movie['originalTitle'];
  movie_posterPath: Movie['posterPath'];
  movie_popularity: Movie['popularity'];
  movie_runtime: Movie['runtime'];
  movie_releaseDate: Movie['releaseDate'];
  movie_letterboxdSlug: Movie['letterboxdSlug'];
  movie_title: Movie['title'];
  movie_genres: Movie['genres'];
  movie_tagline: Movie['tagline'];
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

export interface LetterboxdUserEntrySyncQueryResult extends LetterboxdUserEntrySync {
  user: never;
  username: string;
  userId: number;
}

export interface UserSyncsGetSuccessResponse extends ApiSuccessResponse {
  syncs: LetterboxdUserEntrySyncQueryResult[];
}

export interface UserSyncsPostSuccessResponse extends ApiSuccessResponse {
  
}

export type UserSyncsApiResponse = UserSyncsGetSuccessResponse | UserSyncsPostSuccessResponse | ApiErrorResponse;

export interface UserSyncGetSuccessResponse extends ApiSuccessResponse {
  sync: Omit<LetterboxdUserEntrySync, 'user'>;
}

export type UserSyncApiResponse = UserSyncGetSuccessResponse | ApiErrorResponse;

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

export interface LetterboxdListsForUserPostResponse extends ApiSuccessResponse {
  synced: number;
}

export type LetterboxdListsForUserApiResponse = ApiResponse<LetterboxdListsForUserGetResponse | LetterboxdListsForUserPostResponse>;

export type ApiResponse<T extends ApiSuccessResponse = ApiSuccessResponse> = T | ApiSuccessResponse | ApiErrorResponse;


export interface ListUserStats {
  watched: number;
  entries: FilmEntry[];
  watchedIds: number[];
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

interface LetterboxdListBySlugGetResponse extends ApiSuccessResponse {
  list: LetterboxdList;
}

export type LetterboxdListBySlugApiResponse = ApiResponse<LetterboxdListBySlugGetResponse>;

export interface MovieGetResponse extends ApiSuccessResponse {
  movie: Movie;
};

export type MovieApiResponse = ApiResponse<MovieGetResponse>;

export type BlindspotMovie = Pick<Movie, 'id' | 'title' | 'posterPath' | 'runtime' | 'releaseDate' | 'popularity' | 'status' | 'imdbId' | 'letterboxdSlug' | 'genres'> 
  & { averageRating: number; countRatings: number; loxScore: number; reason?: string; };

export interface UserBlindspotExtras {
  collections?: Collection[];
}

export interface UserBlindspotsGetResponse extends ApiSuccessResponse {
  blindspots: BlindspotMovie[];
  extras?: UserBlindspotExtras;
  unknownIds?: number[];
}

export type UserBlindspotsApiResponse = ApiResponse<UserBlindspotsGetResponse>;

export type BlindspotsSortBy = 'loxScore' | 'loxMostRated' | 'loxHighestRated' | 'releaseDate' | 'title';
