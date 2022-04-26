import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { CastRole } from "./CastRole";
import { CrewRole } from "./CrewRole";
import { Genre } from "./Genre";
import { Person } from "./Person";
import { ProductionCompany } from "./ProductionCompany";
import { Rating } from "./Rating";

@Entity('movies')
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  backdrop_path: string;

  @Column()
  imdb_id: number;

  @Column()
  original_language: string;

  @Column()
  original_title: string;

  @Column()
  overview: string;

  @Column()
  poster_path: string;

  @Column()
  popularity: number;

  @Column()
  runtime: number;

  @Column()
  release_date: string;

  @Column()
  title: string;

  @ManyToMany((type) => Genre)
  @JoinTable({
    name: "join_movies_genres",
    joinColumn: {
      name: "movie_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "genre_id",
      referencedColumnName: "id"
    }
  })
  genres: Genre[];

  @ManyToMany((type) => ProductionCompany)
  @JoinTable({
    name: "join_movies_production_companies",
    joinColumn: {
      name: "movie_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "production_company_id",
      referencedColumnName: "id"
    }
  })
  productionCompanies: ProductionCompany[];

  @OneToMany(() => CastRole, (cast) => cast.movie)
  cast: CastRole[];

  @OneToMany(() => CrewRole, (crew) => crew.movie)
  crew: CrewRole[];

  @ManyToOne(() => Rating, (rating) => rating.movie)
  ratings: Rating[];
}