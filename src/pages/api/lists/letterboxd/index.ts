import { LetterboxdListsManagementApiResponse } from "../../../../common/types/api";
import { getLetterboxdListsRepository } from "../../../../db/repositories";
import { singleQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const ListsManagementRoute = createApiRoute<LetterboxdListsManagementApiResponse>({
  handlers: {
    get: async (req, res) => {
      const ListsRepo = await getLetterboxdListsRepository();
      const lists = await ListsRepo.find({
        order: {
          lastSynced: 'DESC'
        }
      });
      res.json({ success: true, lists });
    },
    post: async (req, res) => {
      const url = singleQueryParam(req.body.url);
      const title = singleQueryParam(req.body.title);
      const description = singleQueryParam(req.body.description);
      
      const ListsRepo = await getLetterboxdListsRepository();
      const found = await ListsRepo.findOneBy({ title });
      if (found) {
        res.json({ success: true });
        return;
      }
      const created = await ListsRepo.create({
        url,
        title,
        description
      });
      await ListsRepo.save(created);
      res.json({ success: true });
    }
  }
});

export default ListsManagementRoute;