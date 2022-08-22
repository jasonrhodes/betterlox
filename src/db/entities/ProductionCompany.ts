import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Relation, ManyToMany } from "typeorm";
import { Movie } from "./Movie";

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

  @ManyToMany(() => Movie, (movie) => movie.productionCompanies)
  movies: Relation<ProductionCompany>[];
}