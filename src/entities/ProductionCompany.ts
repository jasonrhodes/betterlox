import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('production_companies')
export class ProductionCompany extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'logo_path' })
  logoPath: string;

  @Column({ name: 'origin_country' })
  country: string;
}