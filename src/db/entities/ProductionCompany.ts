import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('production_companies')
export class ProductionCompany extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoPath: string;

  @Column({ nullable: true })
  originCountry: string;
}