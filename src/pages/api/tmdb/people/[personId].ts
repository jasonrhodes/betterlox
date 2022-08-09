import { ApiErrorResponse, TmdbActorByIdResponse } from "../../../../common/types/api";
import { singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { tmdb, TmdbPersonWithMovieCredits } from "../../../../lib/tmdb";

const TMDBActorByIdRoute = createApiRoute<TmdbActorByIdResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const pid = singleQueryParam(req.query.personId);
      if (!pid) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'Person ID is required'
        });
      }
      
      try {
        const actor = await tmdb.personInfo({
          id: pid,
          append_to_response: "movie_credits"
        }) as TmdbPersonWithMovieCredits; // personInfo doesn't properly handle append_to_response
        res.json({ success: true, actor });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: err instanceof Error ? err.message : "Unknown error while retrieving actor and movie credits info from TMDB API" });
      }
    }
  }
});

export default TMDBActorByIdRoute;