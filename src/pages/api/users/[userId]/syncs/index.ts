import { getLetterboxdUserEntrySyncRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { SyncsForUserResponse, ApiErrorResponse } from "../../../../../common/types/api";
import { createApiRoute } from "../../../../../lib/routes";
import { numericQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const SyncsForUserRoute = createApiRoute<SyncsForUserResponse | ApiErrorResponse>({
  handlers: {
    get: async (req, res) => {
      const { userId = '' } = req.query;
      const numericUserId = numericQueryParam(userId);

      if (!numericUserId) {
        const message = `Invalid user ID provided ${numericUserId}`;
        console.error(message);
        return res.status(400).json({
          success: false,
          code: 400,
          message
        });
      }

      const UsersRepo = await getUserRepository();
      const user = await UsersRepo.findOneBy({ id: numericUserId });

      if (!user) {
        const message = `No user found for user ID: ${numericUserId}`;
        console.error(message);
        return res.status(400).json({
          success: false,
          code: 400,
          message
        });
      }

      const SyncsRepo = await getLetterboxdUserEntrySyncRepository();
      const syncs = await SyncsRepo.find({
        where: {
          user: {
            id: numericUserId
          } 
        },
        order: {
          startDate: 'DESC'
        },
        take: 100
      });

      return res.status(200).json({
        success: true,
        syncs
      });
    }
  }
});

export default SyncsForUserRoute;