import { getRatingsRepository } from "../../../../../db/repositories/RatingsRepo";
import { createApiRoute } from "../../../../../lib/routes";

const UserRatingsRoute = createApiRoute({
  handlers: {
    get: async (req, res) => {
      const { userId } = req.query;
      try {
        const RatingsRepository = await getRatingsRepository();
        const ratings = await RatingsRepository.find({
          where: {
            userId: Number(userId)
          },
          order: {
            date: "DESC"
          },
          relations: {
            movie: true
          }
        });
        res.json({ ratings });
      } catch (err) {
        res.status(500).json({ err });
      }
    }
  }
});

export default UserRatingsRoute;