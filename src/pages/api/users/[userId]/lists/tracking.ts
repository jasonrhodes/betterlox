import { LetterboxdListsForUserApiResponse } from "../../../../../common/types/api";
import { getLetterboxdListsRepository } from "../../../../../db/repositories";
import { numericQueryParam, singleQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";

const TrackedListsForUserRoute = createApiRoute<LetterboxdListsForUserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortOrder) || 'DESC';
      const LetterboxdListsRepo = await getLetterboxdListsRepository();
      const lists = await LetterboxdListsRepo.find({
        relations: {
          movies: {
            movie: true // TODO: can I change this to { title: true, posterPath: true } ?? 
                        // I was getting error - Property "title" was not found in "Movie". Make sure your query is correct.
          }
        },
        where: {
          trackers: {
            id: userId
          }
        },
        order: {
          [sortBy]: sortDir
        }
      });
      res.json({ success: true, lists });
    }
  }
});

export default TrackedListsForUserRoute;