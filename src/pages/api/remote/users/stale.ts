import { LessThan, MoreThan } from "typeorm";
import { UserPublic } from "@rhodesjason/loxdb/dist/common/types/db";
import { getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { createApiRoute } from "../../../../lib/routes";

type StaleUser = Pick<UserPublic, 'username' | 'lastLogin' | 'lastEntriesUpdate'>;

const SyncUsersEntriesRoute = createApiRoute<{ success: boolean; users: StaleUser[] }>({
    isAdmin: true,
    handlers: {
      get: async (req, res) => {
        try {
          const UsersRepo = await getUserRepository();
          const d = new Date();
          const oneMinute = 1000 * 60;
          const oneHour = oneMinute * 60;
          const oneHourAgo = new Date(d.getTime() - oneHour);

          // get all active users whose Letterboxd
          // entries haven't been updated in the last hour
          const users = await UsersRepo.find({ 
            where: { 
              lastEntriesUpdate: LessThan(oneHourAgo)
            }, 
            order: { 
              lastEntriesUpdate: 'DESC' 
            }
          });

          res.json({
            success: true, 
            users: users.map(
              ({ username, lastLogin, lastEntriesUpdate }) => ({
                username, 
                lastLogin, 
                lastEntriesUpdate 
              })
            ) 
          });
        } catch (error: any) {
          res.status(500).json({
            success: false,
            users: []
          });
        }
      }
    }
});

export default SyncUsersEntriesRoute;