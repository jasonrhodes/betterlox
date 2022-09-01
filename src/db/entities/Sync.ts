import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { SyncStatus, SyncType, SyncTrigger } from "../../common/types/db";

@Entity('syncs')
export class Sync {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: SyncType,
    default: SyncType.UNKNOWN
  })
  type: SyncType;

  @Column({
    type: "enum",
    enum: SyncTrigger,
    default: SyncTrigger.SYSTEM
  })
  trigger: SyncTrigger;

  @Column({ nullable: true })
  secondaryId?: string;

  // letterboxd username for user syncs
  @Column({ nullable: true })
  username: string;

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