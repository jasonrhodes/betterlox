import { LetterboxdUserEntrySyncType, UserPublicSafe } from "@rhodesjason/loxdb/dist/common/types/db";
import { User } from "@rhodesjason/loxdb/dist/db/entities";
import { getLetterboxdUserEntrySyncRepository } from "@rhodesjason/loxdb/dist/db/repositories";
import { syncRecentForUser } from "@rhodesjason/loxdb/dist/lib/syncUserWatches";

export async function syncRecentEntriesForUser({ user }: { user: User | UserPublicSafe; }) {
  const SyncsRepo = await getLetterboxdUserEntrySyncRepository();

  return await SyncsRepo.autoTrack<{}>({
    user,
    type: LetterboxdUserEntrySyncType.RECENT,
    performSync: async () => {
      const result = await syncRecentForUser({ userId: user.id, username: user.username });
      return { syncedCount: result.length };
    }
  });
}