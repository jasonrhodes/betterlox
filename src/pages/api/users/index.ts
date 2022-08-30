import { ApiErrorResponse, UsersApiResponse } from "../../../common/types/api";
import { getUserRepository } from "../../../db/repositories";
import { numericQueryParam } from "../../../lib/queryParams";
import { createApiRoute } from "../../../lib/routes";

const UsersRoute = createApiRoute<UsersApiResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const UsersRepo = await getUserRepository();
      const limit = numericQueryParam(req.query.limit);
      const offset = numericQueryParam(req.query.offset);
      const users = await UsersRepo.getPublicSafeUsers({ limit, offset });
      res.json({ success: true, users });   
    },
  }
});

export default UsersRoute;