import { ApiErrorResponse, ApiSuccessResponse } from "../../common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { getDataSource } from "@rhodesjason/loxdb/dist/db/orm";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const UserTrackListRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const ds = await getDataSource();
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;
      await ds.query(`
          INSERT INTO users_tracked_lists_letterboxd_list ("usersId", "letterboxdListId")
          VALUES ($1, $2)
        `, 
        [userId, listId]
      );

      res.json({ success: true });
    }
  }
});

export default UserTrackListRoute;
