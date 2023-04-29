import { ApiErrorResponse, TmdbPersonByIdResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { tmdb, TmdbPersonWithMovieCredits } from "@rhodesjason/loxdb/dist/lib/tmdb";

const TMDBPersonByIdRoute = createApiRoute<TmdbPersonByIdResponse | ApiErrorResponse>({
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
        const person = await tmdb.personInfo({
          id: pid,
          append_to_response: "movie_credits"
        }) as TmdbPersonWithMovieCredits; // personInfo doesn't properly handle append_to_response

        person.movie_credits.cast = await Promise.all(person.movie_credits.cast.map(async (role) => {
          let imdb_id = role.imdb_id;
          // this lookup seems to add TONS of time to the request, commenting out for now
          // if (!role.imdb_id && role.id) {
          //   const retrieved = await tmdb.movieInfo(role.id);
          //   imdb_id = retrieved.imdb_id;
          // }
          return { ...role, imdb_id };
        }));

        person.movie_credits.crew = await Promise.all(person.movie_credits.crew.map(async (role) => {
          let imdb_id = role.imdb_id;
          // this lookup seems to add TONS of time to the request, commenting out for now
          // if (!role.imdb_id && role.id) {
          //   const retrieved = await tmdb.movieInfo(role.id);
          //   imdb_id = retrieved.imdb_id;
          // }
          return { ...role, imdb_id };
        }));

        res.json({ success: true, person });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: err instanceof Error ? err.message : "Unknown error while retrieving actor and movie credits info from TMDB API" });
      }
    }
  }
});

export default TMDBPersonByIdRoute;