import { tmdb, TmdbMovie, getMovieInfoSafely } from "../../lib/tmdb";
import { Movie } from "../entities";
import { getDataSource } from "../orm";
import { getCollectionsRepository, getGenresRepository, getProductionCompaniesRepository, getFilmEntriesRepository, getCrewRepository, getCastRepository, getPopularLetterboxdMoviesRepository } from ".";
import { addCast, addCrew } from "../../lib/addCredits";
import { InsertResult } from "typeorm";

export const getMoviesRepository = async () => (await getDataSource()).getRepository(Movie).extend({
  async createFromTmdb(movie: TmdbMovie, fields: Partial<Movie> = {}) {
    const genres = movie.genres 
      ? await Promise.all(movie.genres.map(async (genre) => (await getGenresRepository()).createFromTmdb(genre)))
      : [];

    const productionCompanies = movie.production_companies
      ? await Promise.all(movie.production_companies.map(async (company) => (await getProductionCompaniesRepository()).createFromTmdb(company)))
      : [];
    
    const collections = movie.belongs_to_collection
      ? await (await getCollectionsRepository()).createFromTmdb(movie.belongs_to_collection)
      : [];

    const tmdbGenreNames = movie.genres ? movie.genres.map(g => g.name || '').filter(n => n !== '') : [];

    // https://typeorm.io/repository-api#upsert
    return await this.upsert(
      {
        ...fields,
        id: movie.id,
        backdropPath: movie.backdrop_path,
        imdbId: movie.imdb_id,
        originalLanguage: movie.original_language,
        originalTitle: movie.original_title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        popularity: movie.popularity,
        productionCountries: movie.production_countries,
        runtime: movie.runtime,
        releaseDate: movie.release_date,
        status: movie.status,
        tagline: movie.tagline,
        title: movie.title,
        genres: tmdbGenreNames,
        productionCompanies,
        collections
      },
      {
        conflictPaths: ['id'],
        skipUpdateIfNoValuesChanged: true
      }
    );
  },

  async syncMovies(movies: Array<{ movieId: number; userId?: number; letterboxdSlug: string | undefined }>) {
    const retrievedMovies = await Promise.all(movies.map(async ({ movieId, userId, letterboxdSlug }) => ({ 
      tmdbMovie: await getMovieInfoSafely(movieId), 
      letterboxdSlug,
      userId,
      movieId
    })));

    const FilmEntriesRepo = await getFilmEntriesRepository();
    const PopularMoviesRepo = await getPopularLetterboxdMoviesRepository();
    const saved = await Promise.all(retrievedMovies.map(async ({ tmdbMovie, userId, movieId, letterboxdSlug }) => {
      if (tmdbMovie === null || typeof tmdbMovie.id === "undefined") {
        if (userId) {
          await FilmEntriesRepo.update({ movieId, userId }, { unsyncable: true });
        } else {
          await PopularMoviesRepo.update({ id: movieId }, { unsyncable: true })
        }
        return null;
      }

      const savedMovie = await this.createFromTmdb(tmdbMovie, { letterboxdSlug });
      const credits = await tmdb.movieCredits(tmdbMovie.id);

      const addedCast = await addCast({ cast: credits.cast, movieId: tmdbMovie.id });
      const addedCrew = await addCrew({ crew: credits.crew, movieId: tmdbMovie.id });

      const savedCastCount = await (await getCastRepository()).countBy({
        movieId: tmdbMovie.id, 
        personUnsyncable: false 
      });
      const savedCrewCount = await (await getCrewRepository()).countBy({ 
        movieId: tmdbMovie.id, 
        personUnsyncable: false 
      });

      if (addedCast.length === savedCastCount && addedCrew.length === savedCrewCount) {
        await this.update({ id: tmdbMovie.id }, { syncedCredits: true });
      }

      return savedMovie;
    }));

    return saved.filter((m): m is InsertResult => m !== null);
  },
  async getMissingCredits(limit?: number) {
    return this.find({
      where: {
        syncedCredits: false
      },
      take: limit
    });
  },
  async getMissingCollections(limit?: number) {
    return this.find({
      where: {
        syncedCollections: false
      },
      take: limit
    });
  }
});

