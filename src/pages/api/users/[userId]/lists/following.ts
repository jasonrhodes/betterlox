import { FindOptionsWhere, ILike } from "typeorm";
import { LetterboxdListsForUserApiResponse } from "../../../../../common/types/api";
import { LetterboxdList } from "../../../../../db/entities";
import { getLetterboxdListsRepository } from "../../../../../db/repositories";
import { numericQueryParam, singleQueryParam } from "../../../../../lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";

const FollowedListsForUserRoute = createApiRoute<LetterboxdListsForUserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortOrder) || 'DESC';
      const q = singleQueryParam(req.query.q);
      const LetterboxdListsRepo = await getLetterboxdListsRepository();

      const where: FindOptionsWhere<LetterboxdList> = {
        followers: {
          id: userId
        }
      };

      if (q) {
        where.title = ILike(`%${q}%`);
      }
      
      const lists = await LetterboxdListsRepo.find({
        relations: {
          movies: {
            movie: true // TODO: can I change this to { title: true, posterPath: true } ?? 
                        // I was getting error - Property "title" was not found in "Movie". Make sure your query is correct.
          },
          trackers: true,
          followers: true
        },
        where,
        order: {
          [sortBy]: sortDir
        }
      });

      if (sortBy === 'filmCount') {
        lists.sort((a, b) => {
          const compare = a.movies.length > b.movies.length;
          if (sortDir === "ASC") {
            return compare ? 1 : -1;
          }
          if (sortDir === "DESC") {
            return compare ? -1 : 1;
          }
          return 0;
        });
      }
      
      res.json({ success: true, lists });
    }
  }
});

export default FollowedListsForUserRoute;