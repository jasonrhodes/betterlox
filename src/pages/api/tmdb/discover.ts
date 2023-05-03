import { DiscoverMovieRequest, DiscoverMovieResponse } from "moviedb-promise/dist/request-types";
import { ApiErrorResponse } from "../../common/types/api";
import { createApiRoute } from "../../../lib/routes";
import { tmdb } from "@rhodesjason/loxdb/dist/lib/tmdb";

interface TmdbDiscoverResponse {
  success: true;
  movies: DiscoverMovieResponse;
}

const TMDBDiscoverMovieRoute = createApiRoute<TmdbDiscoverResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const options: DiscoverMovieRequest = req.body;
      console.log(JSON.stringify(req.body, null, 2));
      const results = await tmdb.discoverMovie(options);
      res.json({
        success: true,
        movies: results
      });
    }
  }
});

export default TMDBDiscoverMovieRoute;