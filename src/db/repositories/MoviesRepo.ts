import { JOB_ALLOW_LIST } from "../../common/constants";
import { tmdb, TmdbCredits, TmdbMovie, getMovieInfoSafely } from "../../lib/tmdb";
import { Movie } from "../entities";
import { getDataSource } from "../orm";
import { getCastRepository, getCollectionsRepository, getCrewRepository, getGenresRepository, getProductionCompaniesRepository } from ".";

export const getMoviesRepository = async () => (await getDataSource()).getRepository(Movie).extend({
  async createFromTmdb(movie: TmdbMovie, credits?: TmdbCredits) {
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

  async syncMovies(ids: number[]) {
    const retrievedMovies = await Promise.all(ids.map((id) => getMovieInfoSafely(id)));

    const MoviesRepo = await getMoviesRepository();
    const saved = await Promise.all(retrievedMovies.map(async (tmdbMovie) => {
      if (tmdbMovie === null || typeof tmdbMovie.id === "undefined") {
        return null;
      }

      const credits = await tmdb.movieCredits(tmdbMovie.id);
      const savedMovie = await MoviesRepo.createFromTmdb(tmdbMovie);

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