import { NextApiHandler } from "next";
import { getActorsForUser } from "../../../../../server/db/client";

const UserStatsActorsRoute: NextApiHandler = async (req, res) => {
  const { userId, castOrderThreshold } = req.query;
  const numericUserId = Number(userId);
  const numericCastOrderThreshold = Number(castOrderThreshold);

  const actors = await getActorsForUser({
    userId: numericUserId,
    castOrderThreshold: !isNaN(numericCastOrderThreshold) ? numericCastOrderThreshold : undefined
  });

  res.json({ actors });
}

export default UserStatsActorsRoute;