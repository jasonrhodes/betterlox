import { UserApiResponse } from "../../../../common/types/api";
import { getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { createApiRoute } from "../../../../lib/routes";
import { UserPublicSafe } from "@rhodesjason/loxdb/dist/common/types/db";

const UserRoute = createApiRoute<UserApiResponse>({
  handlers: {
    get: async (req, res) => {
      const UsersRepo = await getUserRepository();
      const userId = singleQueryParam(req.query.userId);
      const numericUserId = Number(userId);
      let safeUser: UserPublicSafe | null = null;

      if (userId === undefined) {
        res.status(400).json({ success: false, code: 400, message: 'No user id or username provided in route' });
        return;
      }

      if (isNaN(numericUserId)) {
        // if userId is NaN, it might be a string username
        const username = userId;
   
        const user = await UsersRepo.findOne({
          where: { 
            username
          },
          relations: {
            settings: true,
            letterboxdEntrySyncs: true
          }
        });

        if (!user) {
          res.status(400).json({ success: false, code: 400, message: 'No user id or username provided in route' });
          return;
        }

        safeUser = UsersRepo.convertUserToPublicSafe(user);
      } else {
        // this else means numericUserId is a valid number, so it's a user ID and not a username
        safeUser = await UsersRepo.getPublicSafeUser(numericUserId, { relations: { letterboxdEntrySyncs: true }});
      }

      if (safeUser === null) {
        res.status(404).json({ success: false, code: 404, message: 'User not found' });
        return;
      } else {
        res.json({ success: true, user: safeUser });   
      } 
    },
  }
});

export default UserRoute;