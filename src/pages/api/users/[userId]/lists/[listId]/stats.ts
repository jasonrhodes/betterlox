import { ApiErrorResponse, ApiSuccessResponse, UserListStatsApiResponse } from "../../../../../../common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { getFilmEntriesRepository, getLetterboxdListsRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { In } from "typeorm";

const UserFollowListRoute = createApiRoute<UserListStatsApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;

      const ListsRepo = await getLetterboxdListsRepository();
      const list = await ListsRepo.findOne({
        relations: {
          movies: {
            movie: true
          }
        },
        where: {
          id: listId
        }
      });

      if (!list) {
        res.status(404).json({
          success: false,
          code: 404,
          message: `List (ID: ${listId}) not found`
        });
        return;
      }

      const movieIds = list.movies.map(entry => entry.movieId);

      const FilmEntriesRepo = await getFilmEntriesRepository();
      const entries = await FilmEntriesRepo.find({
        where: {
          userId,
          movieId: In(movieIds)
        }
      });

      const stats = {
        movies: movieIds.length,
        watched: entries.length,
        watchedIds: entries.map(e => e.movieId),
        entries
      };

      res.json({ success: true, stats });
    }
  }
});



export default UserFollowListRoute;
