import { JOB_ALLOW_LIST } from "../../common/constants";
import { tmdb, TmdbMovie, getMovieInfoSafely } from "../../lib/tmdb";
import { Movie } from "../entities";
import { getDataSource } from "../orm";
import { getCollectionsRepository, getGenresRepository, getProductionCompaniesRepository, getRatingsRepository, getCrewRepository, getCastRepository } from ".";
import { addCast, addCrew } from "../../lib/addCredits";

export const getMoviesRepository = async () => (await getDataSource()).getRepository(Movie).extend({
  async createFromTmdb(movie: TmdbMovie, slug?: string | null) {
    const genres = movie.genres 
      ? await Promise.all(movie.genres.map(async (genre) => (await getGenresRepository()).createFromTmdb(genre)))
      : [];

    const productionCompanies = movie.production_companies
      ? await Promise.all(movie.production_companies.map(async (company) => (await getProductionCompaniesRepository()).createFromTmdb(company)))
      : [];
    
    const collections = movie.belongs_to_collection
      ? await (await getCollectionsRepository()).createFromTmdb(movie.belongs_to_collection)
      : [];

    const created = this.create({
      id: movie.id,
      backdropPath: movie.backdrop_path,
      imdbId: movie.imdb_id,
      letterboxdSlug: slug === null ? undefined : slug,
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
      genres,
      productionCompanies,
      collections
    });

    return this.save(created);
  },

  async syncMovies(movies: Array<{ movieId: number; userId: number; letterboxdSlug: string | null }>) {
    const retrievedMovies = await Promise.all(movies.map(async ({ movieId, userId, letterboxdSlug }) => ({ 
      tmdbMovie: await getMovieInfoSafely(movieId), 
      slug: letterboxdSlug,
      userId,
      movieId
    })));

    const RatingsRepo = await getRatingsRepository();
    const saved = await Promise.all(retrievedMovies.map(async ({ tmdbMovie, userId, movieId, slug }) => {
      if (tmdbMovie === null || typeof tmdbMovie.id === "undefined") {
        await RatingsRepo.update({ movieId, userId }, { unsyncable: true });
        return null;
      }

      const savedMovie = await this.createFromTmdb(tmdbMovie, slug);
      const credits = await tmdb.movieCredits(tmdbMovie.id);

      const addedCast = await addCast({ cast: credits.cast, movie: savedMovie });
      const addedCrew = await addCrew({ crew: credits.crew, movie: savedMovie });

      const savedCastCount = await (await getCastRepository()).countBy({
        movieId: tmdbMovie.id, 
        personUnsyncable: false 
      });
      const savedCrewCount = await (await getCrewRepository()).countBy({ 
        movieId: tmdbMovie.id, 
        personUnsyncable: false 
      });

      if (addedCast.length === savedCastCount && addedCrew.length === savedCrewCount) {
        savedMovie.syncedCredits = true;
      }

      return savedMovie;
    }));

    return saved.filter((m) => m !== null);
  },
  async getMissingCredits(limit?: number) {
    return this.find({
      where: {
        syncedCredits: false
      },
      take: limit
    });
  }
});