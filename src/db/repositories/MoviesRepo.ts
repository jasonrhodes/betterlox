import { JOB_ALLOW_LIST } from "../../common/constants";
import { tmdb, TmdbMovie, getMovieInfoSafely } from "../../lib/tmdb";
import { Movie } from "../entities";
import { getDataSource } from "../orm";
import { getCastRepository, getCollectionsRepository, getCrewRepository, getGenresRepository, getProductionCompaniesRepository } from ".";

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

  async syncMovies(movies: Array<{ movieId: number; letterboxdSlug: string | null }>) {
    const retrievedMovies = await Promise.all(movies.map(async ({ movieId, letterboxdSlug }) => ({ 
      tmdbMovie: await getMovieInfoSafely(movieId), 
      slug: letterboxdSlug 
    })));

    const saved = await Promise.all(retrievedMovies.map(async ({ tmdbMovie, slug }) => {
      if (tmdbMovie === null || typeof tmdbMovie.id === "undefined") {
        return null;
      }

      const credits = await tmdb.movieCredits(tmdbMovie.id);
      const savedMovie = await this.createFromTmdb(tmdbMovie, slug);

      const CastRepo = await getCastRepository();
      const CrewRepo = await getCrewRepository();

      if (credits.cast) {
        const filtered = credits.cast.filter((role) => role.order && role.order > 50);
        savedMovie.cast = await Promise.all(
          filtered.map(
            role => CastRepo.createFromTmdb(savedMovie.id, role)
          )
        );
      }

      if (credits.crew) {
        const filtered = credits.crew.filter((role) => role.job && JOB_ALLOW_LIST.includes(role.job));
        savedMovie.crew = await Promise.all(
          filtered.map(
            role => CrewRepo.createFromTmdb(savedMovie.id, role)
          )
        );
      }
    
      return savedMovie;
    }));

    return saved.filter((m) => m !== null);
  }
});