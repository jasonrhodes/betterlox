import { Not } from "typeorm";
import { SyncStatus, SyncType } from "../../common/types/db";
import { Sync } from "../entities";
import { getDataSource } from "../orm";

export const getSyncRepository = async () => (await getDataSource()).getRepository(Sync).extend({
  async queueSync() {
    const created = this.create();
    const sync = await this.save(created);
    const started = await this.find({
      where: [
        { id: Not(sync.id), status: SyncStatus.PENDING },
        { id: Not(sync.id), status: SyncStatus.IN_PROGRESS }
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
  }
});