import { ApiErrorResponse, ApiSuccessResponse } from "../../../../../../common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { getDataSource } from "../../../../../../db/orm";
import { numericQueryParam } from "../../../../../../lib/queryParams";

const UserUnfollowListRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const ds = await getDataSource();
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;

      const response = await ds.query(`
        DELETE FROM letterboxd_list_follow llf
        WHERE llf."listId" = ${listId}
        AND llf."userId" = ${userId}`
      );

      res.json({ success: true });
    }
  }
});

export default UserUnfollowListRoute;
