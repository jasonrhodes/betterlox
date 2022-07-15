import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('genres')
export class Genre extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}