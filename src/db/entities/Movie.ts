import { ProductionCountry } from "moviedb-promise/dist/types";
import {
  BaseEntity,
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  Relation,
  PrimaryColumn
} from "typeorm";
import { CastRole } from "./CastRole";
import { Collection } from "./Collection";
import { CrewRole } from "./CrewRole";
import { Genre } from "./Genre";
import { ProductionCompany } from "./ProductionCompany";
import { Rating } from "./Rating";

@Entity('movies')
export class Movie extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  backdropPath: string;

  @Column({ nullable: true })
  imdbId: string;

  @Column()
  originalLanguage: string;

  @Column()
  originalTitle: string;

  @Column()
  overview: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column("float")
  popularity: number;

  @Column("varchar", { array: true })
  productionCountries: ProductionCountry[];

  @Column()
  runtime: number;

  @Column()
  releaseDate: string;

  @Column()
  status: string;

  @Column()
  tagline: string;

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

  @ManyToMany(() => Collection)
  collections: Relation<Collection[]>;

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