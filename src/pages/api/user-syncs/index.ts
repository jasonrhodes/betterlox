import { LetterboxdUserEntrySyncStatus, LetterboxdUserEntrySyncType } from "@rhodesjason/loxdb/dist/common/types/db";
import { LetterboxdUserEntrySyncQueryResult, UserSyncsApiResponse } from "../../../common/types/api";
import { createApiRoute } from "../../../lib/routes";
import { getLetterboxdUserEntrySyncRepository, getUserRepository } from "@rhodesjason/loxdb/dist/db/repositories";

const rawQuery = `
SELECT u.id, u.username, ls.*
FROM letterboxd_user_entry_sync ls
INNER JOIN users u ON ls."userId" = u.id
INNER JOIN (
	SELECT lsi.type, u.username, MAX(lsi."lastUpdated") AS max_updated
	FROM letterboxd_user_entry_sync lsi
	INNER JOIN users u ON lsi."userId" = u.id
	GROUP BY lsi.type, u.username
) latest
ON ls.type = latest.type
AND ls."lastUpdated" = latest.max_updated
AND u.username = latest.username
ORDER BY ls."lastUpdated" DESC;
`;

function isValidType(value: string | undefined): value is LetterboxdUserEntrySyncType {
  if (!value) {
    return false;
  }
  return Object.values(LetterboxdUserEntrySyncType).includes(value as LetterboxdUserEntrySyncType);
}

const UserSyncsApi = createApiRoute<UserSyncsApiResponse>({
  handlers: {
    get: async (req, res) => {
      try {
        const UserSyncsRepo = await getLetterboxdUserEntrySyncRepository();
        const syncs = (await UserSyncsRepo.query(rawQuery)) as LetterboxdUserEntrySyncQueryResult[];
        res.json({ success: true, syncs });
      } catch (err: unknown) {
        console.log('error', err);
        res.status(500).json({ success: false, code: 500, message: String(err) })
      }
    },
    post: async (req, res) => {
      const { userId, username, type, notes } = req.body;
      const UserSyncsRepo = await getLetterboxdUserEntrySyncRepository();
      const d = new Date();
      let numericUserId = Number(userId);

      if (!isValidType(type)) {
        res.status(400).json({ success: false, code: 400, message: `Invalid 'type' value, 'type' must be one of "${Object.values(LetterboxdUserEntrySyncType).join('", "') }"` });
        return;
      }

      if (isNaN(numericUserId)) {
        if (typeof username === "string") {
          const UsersRepo = await getUserRepository();
          const user = await UsersRepo.findOneBy({ username });
          if (user) {
            numericUserId = user.id;
          }
        }
      }

      if (isNaN(numericUserId)) {
        res.status(400).json({ success: false, code: 400, message: `Must specify either a numeric userId or a valid username` });
        return;
      }

      const sync = await UserSyncsRepo.create({
        type,
        status: LetterboxdUserEntrySyncStatus.REQUESTED,
        lastUpdated: d,
        requestDate: d,
        notes: String(notes),
        user: {
          id: numericUserId
        }
      });

      await UserSyncsRepo.save(sync);
      res.json({ success: true });
    }
  }
});

export default UserSyncsApi;