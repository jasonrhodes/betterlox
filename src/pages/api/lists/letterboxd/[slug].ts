import { LetterboxdListBySlugApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { getLetterboxdListsRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const ListBySlugRoute = createApiRoute<LetterboxdListBySlugApiResponse>({
  handlers: {
    get: async (req, res) => {
      const username = singleQueryParam(req.query.username);
      const slug = singleQueryParam(req.query.slug)!;
      const ListsRepo = await getLetterboxdListsRepository();

      if (!username) {
        res.status(400).json({ success: false, code: 400, message: 'username is a required field'})
      }

      const listPath = `/${username}/list/${slug}/`.replace('//', '/');

      console.log(`Attempting to find list by url: ${listPath}`);

      const list = await ListsRepo.findOne({
        relations: {
          movies: {
            movie: true
          },
          owner: true,
          trackers: true,
          followers: true
        },
        where: [
          {
            url: `https://letterboxd.com${listPath}`
          },
          {
            url: listPath
          }
        ]
      });

      if (!list) {
        res.status(404).json({ success: false, code: 404, message: 'List not found' });
        return;
      }

      list.movies.sort((a, b) => typeof a.order === "number" && typeof b.order === "number" && a.order < b.order ? -1 : 1);

      res.json({ success: true, list });
    }
  }
});

export default ListBySlugRoute;