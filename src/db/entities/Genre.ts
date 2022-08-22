import { BaseEntity, Entity, PrimaryColumn, Column, ManyToMany, Relation } from "typeorm";
import { Movie } from "./Movie";

@Entity('genres')
export class Genre {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Relation<Movie>[];
}