import { ApiErrorResponse, ApiSuccessResponse } from "../../../../../../common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { getDataSource } from "../../../../../../db/orm";
import { numericQueryParam } from "../../../../../../lib/queryParams";

const UserFollowListRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const ds = await getDataSource();
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;

      const response = await ds.query(`
        INSERT INTO letterboxd_list_follow ("userId", "listId")
        SELECT * FROM (
          VALUES (${userId}, ${listId})
        ) AS t (numeric, numeric)
        WHERE NOT EXISTS (
          SELECT id, "ownerId" FROM letterboxd_list ll
          WHERE ll.id = ${listId}
          AND "ownerId" = ${userId}
        )`
      );

      console.log("FINISHED", JSON.stringify(response, null, 2));
      res.json({ success: true });
    }
  }
});

export default UserFollowListRoute;
