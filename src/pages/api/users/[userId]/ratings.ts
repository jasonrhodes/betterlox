import { NextApiHandler } from "next";
import { getRatingsRepository } from "../../../../db/repositories/RatingsRepo";

const UserRatingsRoute: NextApiHandler = async (req, res) => {
  const { userId } = req.query;
  try {
    const RatingsRepository = await getRatingsRepository();
    const ratings = await RatingsRepository.find({
      where: {
        userId: Number(userId)
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

export default UserRatingsRoute;