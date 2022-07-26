import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { SyncStatus, SyncType } from "../../common/types/db";

@Entity('syncs')
export class Sync {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: SyncType,
    default: SyncType.UNKNOWN
  })
  type: string;

  @Column({
    type: "enum",
    enum: SyncStatus,
    default: SyncStatus.PENDING
  })
  status: SyncStatus;

  @CreateDateColumn()
  started: Date;

  @Column({ nullable: true })
  finished: Date;

  @Column({ nullable: true })
  numSynced: number;

  @Column({ nullable: true })
  errorMessage: string;
}