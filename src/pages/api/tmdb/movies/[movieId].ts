import { TmdbMovieByIdApiResponse } from "../../../../common/types/api";
import { getMoviesRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { tmdb } from "@rhodesjason/loxdb/dist/lib/tmdb";

const TmdbMovieByIdRoute = createApiRoute<TmdbMovieByIdApiResponse>({
  handlers: {
    get: async (req, res) => {
      let responded = false;
      const id = numericQueryParam(req.query.movieId);
      if (!id) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Movie ID is required'
        });
      }
      
      try {
        const movie = await tmdb.movieInfo(id);

        res.json({ success: true, movie: {
          id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date
        }});

        responded = true;

        const MoviesRepo = await getMoviesRepository();
        await MoviesRepo.createFromTmdb(movie);
      } catch (error: unknown) {
        const message = getErrorAsString(error);
        console.log(`Error while retrieving movie from TMDB (ID: ${id}), message:`, message);
        
        if (!responded) {
          res.status(500).json({ success: false, code: 500, message });
        }
      }
    }
  }
});

export default TmdbMovieByIdRoute;