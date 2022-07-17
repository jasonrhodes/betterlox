import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  Relation
} from "typeorm";
import { CastRole } from "./CastRole";
import { CrewRole } from "./CrewRole";
import { Genre } from "./Genre";
import { ProductionCompany } from "./ProductionCompany";
import { Rating } from "./Rating";

@Entity('movies')
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  backdropPath: string;

  @Column()
  imdbId: number;

  @Column()
  originalLanguage: string;

  @Column()
  originalTitle: string;

  @Column()
  overview: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column()
  popularity: number;

  @Column()
  runtime: number;

  @Column()
  releaseDate: string;

  @Column()
  title: string;

  @ManyToMany((type) => Genre)
  @JoinTable({
    name: "join_movies_genres",
    joinColumn: {
      name: "movieId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "genreId",
      referencedColumnName: "id"
    }
  })
  genres: Relation<Genre[]>;

  @ManyToMany((type) => ProductionCompany)
  @JoinTable({
    name: "join_movies_production_companies",
    joinColumn: {
      name: "movieId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "productionCompanyId",
      referencedColumnName: "id"
    }
  })
  productionCompanies: Relation<ProductionCompany[]>;

  // OneToMany because we use a join table entity,
  // because we have attributes on the join
  @OneToMany(() => CastRole, (cast) => cast.movie)
  cast: Relation<CastRole[]>;

  // OneToMany because we use a join table entity,
  // because we have attributes on the join
  @OneToMany(() => CrewRole, (crew) => crew.movie)
  crew: Relation<CrewRole[]>;

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Relation<Rating[]>;
}