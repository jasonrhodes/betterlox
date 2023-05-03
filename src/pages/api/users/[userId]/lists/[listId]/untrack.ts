import { ApiErrorResponse, ApiSuccessResponse } from "../../../../../../common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { getDataSource } from "@rhodesjason/loxdb/dist/db/orm";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const UserUntrackListRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const ds = await getDataSource();
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;
      await ds.query(`
          DELETE FROM users_tracked_lists_letterboxd_list
          WHERE "usersId" = $1
          AND "letterboxdListId" = $2
        `, 
        [userId, listId]
      );

      res.json({ success: true });
    }
  }
});

export default UserUntrackListRoute;
