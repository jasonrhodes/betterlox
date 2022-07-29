import { Entity, Column, Relation, PrimaryColumn, ManyToMany, JoinTable } from "typeorm";
import { Movie } from "./Movie";

@Entity('collections')
export class Collection {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column({ nullable: true })
  backdropPath: string;

  @ManyToMany(() => Movie, movie => movie.collections)
  @JoinTable()
  movies: Relation<Movie[]>
}