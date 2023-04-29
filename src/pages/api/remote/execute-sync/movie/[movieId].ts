import { getMoviesRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { createApiRoute } from "../../../../../lib/routes";
import { ApiErrorResponse, SyncOneMovieCredits, SyncOneMovieCollections } from "@rhodesjason/loxdb/dist/common/types/api";
import { numericQueryParam, singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { syncOneMovieCredits } from "@rhodesjason/loxdb/dist/lib/managedSyncs/syncMoviesCredits";
import { syncOneMovieCollections } from "@rhodesjason/loxdb/dist/lib/managedSyncs/syncMoviesCollections";

type SyncOneMovieResponses = 
  SyncOneMovieCredits | 
  SyncOneMovieCollections;

const SyncOneMovieRoute = createApiRoute<SyncOneMovieResponses | ApiErrorResponse>({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      const id = numericQueryParam(req.query.movieId);
      const type = singleQueryParam(req.body.type);
      if (!type || !id) {
        return res.status(400).json({ success: false, code: 400, message: 'Type is required' });
      }
      const MoviesRepo = await getMoviesRepository();
      const movie = await MoviesRepo.findOneBy({ id });
      if (!movie) {
        return res.status(404).json({ success: false, code: 400, message: `Movie ID ${id} not found`});
      }

      switch (type) {
        case "credits":
          const { syncedCrewRoles: crew, syncedCastRoles: cast } = await syncOneMovieCredits(movie);
          res.json({ success: true, movie, syncedCredits: { cast, crew }});
          break;
        
        case "collections":
          const { syncedCollections } = await syncOneMovieCollections(movie);
          res.json({ success: true, movie, syncedCollections });
          break;

        default:
          res.status(400).json({ success: false, code: 400, message: `Invalid sync type: ${type}` })
      }
      
    }
  }
});

export default SyncOneMovieRoute;
