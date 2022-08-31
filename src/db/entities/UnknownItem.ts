import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('unknown_items')
@Unique('UQ_ID', ['type', 'itemId'])
export class UnknownItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'movie' | 'person';

  @Column()
  itemId: number;
}