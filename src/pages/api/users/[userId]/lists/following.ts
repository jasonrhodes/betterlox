import { FindOptionsWhere, ILike } from "typeorm";
import { LetterboxdListsForUserApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { LetterboxdList } from "@rhodesjason/loxdb/dist/db/entities";
import { getLetterboxdListsRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { numericQueryParam, singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../../lib/routes";

const FollowedListsForUserRoute = createApiRoute<LetterboxdListsForUserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const userId = numericQueryParam(req.query.userId)!
      const sortBy = singleQueryParam(req.query.sortBy) || 'publishDate';
      const sortDir = singleQueryParam(req.query.sortDir) || 'DESC';
      const limit = numericQueryParam(req.query.perPage, 10);
      const offset = (numericQueryParam(req.query.page, 1) - 1) * limit;
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

      const totalCount = await LetterboxdListsRepo.countBy(where);
      
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
        take: limit,
        skip: offset,
        order: {
          [sortBy]: sortDir
        }
      });
      
      res.json({ success: true, lists, totalCount });
    }
  }
});

export default FollowedListsForUserRoute;