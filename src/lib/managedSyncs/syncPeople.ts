import { SyncType, SyncStatus } from "../../common/types/db";
import { Sync } from "../../db/entities";
import { getSyncRepository, getCastRepository, getPeopleRepository, getCrewRepository } from "../../db/repositories";

export async function syncCastPeople(sync: Sync, limit?: number) {
  sync.type = SyncType.MOVIES_CAST;
  const CastRepo = await getCastRepository();
  const missingCastPeople = await CastRepo.getCastRolesWithMissingPeople(limit);
  return syncPeople(sync, missingCastPeople);
}

export async function syncCrewPeople(sync: Sync, limit?: number) {
  sync.type = SyncType.MOVIES_CREW;
  const CrewRepo = await getCrewRepository();
  const missingCrewPeople = await CrewRepo.getCrewRolesWithMissingPeople(limit);
  return syncPeople(sync, missingCrewPeople);
}

export async function syncPeople(sync: Sync, peopleIds: number[]) {
  if (peopleIds.length === 0) {
    return [];
  }

  const SyncRepo = await getSyncRepository();
  SyncRepo.save(sync);

  const PeopleRepo = await getPeopleRepository();
  const synced = await PeopleRepo.syncPeople(peopleIds);
  if (synced.length > 0) {
    await SyncRepo.endSync(sync, {
      status: SyncStatus.COMPLETE,
      numSynced: synced.length
    });
  } else {
    console.log(`Attempted to sync ${peopleIds.length} people, but 0 were synced. Attempted IDs: ${peopleIds.join(', ')}`);
    sync.numSynced = 0;
  }
  return synced;
}