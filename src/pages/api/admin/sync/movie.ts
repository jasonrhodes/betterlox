import { getMoviesRepository } from "../../../../db/repositories";
import { createApiRoute } from "../../../../lib/routes";
import { ApiErrorResponse, SyncOneMovieCredits } from "../../../../common/types/api";
import { numericQueryParam } from "../../../../lib/queryParams";
import { syncOneMovie } from "../../../../lib/managedSyncs/syncMoviesCredits";

const SyncOneMovieRoute = createApiRoute<SyncOneMovieCredits | ApiErrorResponse>({
  isAdmin: true,
  handlers: {
    post: async (req, res) => {
      const id = numericQueryParam(req.body.id);
      if (!id) {
        return res.status(400).json({ success: false, code: 400, message: 'ID is required' });
      }
      const MoviesRepo = await getMoviesRepository();
      const movie = await MoviesRepo.findOneBy({ id });
      if (!movie) {
        return res.status(404).json({ success: false, code: 400, message: `Movie ID ${id} not found`});
      }
      const { syncedCrewRoles: crew, syncedCastRoles: cast } = await syncOneMovie(movie);

      res.json({ success: true, movie, syncedCredits: { cast, crew }});
    }
  }
});

export default SyncOneMovieRoute;
