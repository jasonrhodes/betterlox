import { MoreThan, Not } from "typeorm";
import { SyncStatus, SyncTrigger, SyncType } from "../../common/types/db";
import { Sync } from "../entities";
import { getDataSource } from "../orm";

function minutesAgo(min: number, date: Date = new Date()) {
  return new Date(date.getTime() - (min * 60 * 1000));
}

export const getSyncRepository = async () => (await getDataSource()).getRepository(Sync).extend({
  async queueSync({ trigger = SyncTrigger.SYSTEM, username }: { trigger: SyncTrigger, username?: string }) {
    const created = this.create({ username, trigger });
    const sync = await this.save(created);
    const minStart = minutesAgo(10); // wait for a rogue sync before we close that and start a new one
    const systemWhere = {
      trigger,
      username,
      id: Not(sync.id),
      started: MoreThan(minStart)
    };
    const syncsInProgress = await this.find({
      where: [
        { ...systemWhere, status: SyncStatus.PENDING },
        { ...systemWhere, status: SyncStatus.IN_PROGRESS }
      ]
    });

    return { syncsInProgress, sync };
  },

  async skipSync(sync: Sync) {
    sync.status = SyncStatus.SKIPPED;
    sync.finished = new Date();
    sync.numSynced = 0;
    return await this.save(sync);
  },

  async startSync(sync: Sync) {
    sync.status = SyncStatus.IN_PROGRESS;
    return await this.save(sync);
  },

  async endSync(sync: Sync, {
    type,
    status,
    numSynced,
    secondaryId,
    errorMessage
  }: Partial<Sync>) {
    if (type) {
      sync.type = type;
    }
    if (numSynced) {
      sync.numSynced = numSynced;
    }
    if (errorMessage) {
      sync.errorMessage = errorMessage;
    }
    if (status) {
      sync.status = status;
    }
    sync.secondaryId = secondaryId;
    sync.finished = new Date();
    return await this.save(sync);
  },

  async clearUnfinished({ trigger }: { trigger: SyncTrigger }) {
    return Promise.all([
      this.delete({ trigger, status: SyncStatus.IN_PROGRESS }),
      this.delete({ trigger, status: SyncStatus.PENDING })
    ]);
  }
});