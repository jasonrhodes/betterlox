import { ApiErrorResponse, ApiSuccessResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { createApiRoute } from "../../../../../../lib/routes";
import { getDataSource } from "@rhodesjason/loxdb/dist/db/orm";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const UserFollowListRoute = createApiRoute<ApiSuccessResponse | ApiErrorResponse>({
  handlers: {
    post: async (req, res) => {
      const ds = await getDataSource();
      const userId = numericQueryParam(req.query.userId)!;
      const listId = numericQueryParam(req.query.listId)!;

      await ds.query(`
          INSERT INTO users_followed_lists_letterboxd_list ("usersId", "letterboxdListId")
          VALUES ($1, $2)
        `, 
        [userId, listId]
      );

      // await ds.query(`
      //   INSERT INTO letterboxd_list_follow ("userId", "listId")
      //   SELECT * FROM (
      //     VALUES (${userId}, ${listId})
      //   ) AS t (numeric, numeric)
      //   WHERE NOT EXISTS (
      //     SELECT id, "ownerId" FROM letterboxd_list ll
      //     WHERE ll.id = ${listId}
      //     AND "ownerId" = ${userId}
      //   )`
      // );

      res.json({ success: true });
    }
  }
});

// INSERT INTO letterboxd_list_follow ("userId", "listId")
// SELECT * FROM (
//   VALUES (${userId}, ${listId})
// ) AS t (numeric, numeric)
// WHERE NOT EXISTS (
//   SELECT id, "ownerId" FROM letterboxd_list ll
//   WHERE ll.id = ${listId}
//   AND "ownerId" = ${userId}
// )

export default UserFollowListRoute;
