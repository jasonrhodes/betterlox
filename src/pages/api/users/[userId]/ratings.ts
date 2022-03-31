import { NextApiHandler } from "next";
import { getRatingsForUser } from "../../../../server/db/client";

const UserRatingsRoute: NextApiHandler = async (req, res) => {
  const { userId } = req.query;
  try {
    const ratings = await getRatingsForUser({ userId: Number(userId) });
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ err });
  }
}

export default UserRatingsRoute;