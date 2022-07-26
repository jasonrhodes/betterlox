import { NextApiHandler } from "next";
import { numericQueryParam } from "../../../../lib/queryParams";
import { syncAllRatingsForUser, SyncRatingsError } from "../../../../lib/syncAllRatingsForUser";

const UserSyncRoute: NextApiHandler = async (req, res) => {
  const { userId = '' } = req.query;
  const numericUserId = numericQueryParam(userId);
  if (typeof numericUserId === "undefined" || isNaN(numericUserId)) {
    throw new Error('Invalid userID');
  }

  try {
    const { synced, username } = await syncAllRatingsForUser(numericUserId);
    res.status(200).json({ synced, username, count: synced.length });
  } catch (error: unknown) {
    if (error instanceof SyncRatingsError) {
      const { message, synced, username } = error;
      res.status(500).json({ message, synced, username });
    }
  }
}

export default UserSyncRoute;