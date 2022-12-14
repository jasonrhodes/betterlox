import { ApiErrorResponse, UserApiResponse } from "../../../../common/types/api";
import { getUserRepository } from "../../../../db/repositories";
import { numericQueryParam } from "../../../../lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";

const UserRoute = createApiRoute<UserApiResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const UsersRepo = await getUserRepository();
      const userId = numericQueryParam(req.query.userId)!;
      const user = await UsersRepo.getPublicSafeUser(userId);

      if (user === null) {
        // TODO should this return a real 404?
        res.json({ success: false, code: 404, message: 'User not found' })
      } else {
        res.json({ success: true, user });   
      } 
    },
  }
});

export default UserRoute;