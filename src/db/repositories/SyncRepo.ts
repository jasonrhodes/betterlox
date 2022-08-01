import { MoreThan, Not } from "typeorm";
import { SyncStatus, SyncTrigger, SyncType } from "../../common/types/db";
import { Sync } from "../entities";
import { getDataSource } from "../orm";

function minutesAgo(min: number, date: Date = new Date()) {
  return new Date(date.getTime() - (min * 60 * 1000));
}

export const getSyncRepository = async () => (await getDataSource()).getRepository(Sync).extend({
  async queueSync({ trigger = SyncTrigger.SYSTEM, username }: { trigger: SyncTrigger, username?: string }) {
    const created = this.create({ username });
    const sync = await this.save(created);
    const minStart = minutesAgo(15); // wait 15 min for a rogue sync before we close that and start a new one
    const systemWhere = {
      trigger,
      username,
      id: Not(sync.id),
      started: MoreThan(minStart)
    };
    const started = await this.find({
      where: [
        { ...systemWhere, status: SyncStatus.PENDING },
        { ...systemWhere, status: SyncStatus.IN_PROGRESS }
      ]
    });

    return { started, sync };
  },

  async skipSync(sync: Sync) {
    sync.status = SyncStatus.SKIPPED;
    sync.finished = new Date();
    sync.numSynced = 0;
    return this.save(sync);
  },

  async startSync(sync: Sync) {
    sync.status = SyncStatus.IN_PROGRESS;
    return this.save(sync);
  },

  async endSync(sync: Sync, {
    type,
    status,
    numSynced,
    errorMessage
  }: {
    status: SyncStatus;
    type?: SyncType;
    numSynced?: number;
    errorMessage?: string;
  }) {
    if (type) {
      sync.type = type;
    }
    if (numSynced) {
      sync.numSynced = numSynced;
    }
    if (errorMessage) {
      sync.errorMessage = errorMessage;
    }
    sync.status = status;
    sync.finished = new Date();
    return this.save(sync);
  },

  async clearUnfinished({ trigger }: { trigger: SyncTrigger }) {
    return Promise.all([
      this.delete({ trigger, status: SyncStatus.IN_PROGRESS }),
      this.delete({ trigger, status: SyncStatus.PENDING })
    ]);
  }
});