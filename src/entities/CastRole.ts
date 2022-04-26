import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_cast')
export class CastRole extends BaseEntity {
  @PrimaryColumn({ name: "movie_id" })
  movieId: number;

  @PrimaryColumn({ name: "person_id" })
  personId: number;

  @Column({ name: "cast_id" })
  castId: number;

  @Column({ nullable: true })
  character: string;

  @Column({ name: "cast_order" })
  castOrder: number;

  @Column({ name: "credit_id" })
  creditId: string;

  @ManyToOne(() => Person, (person) => person.castRoles)
  @JoinColumn({ name: "person_id" })
  actor: Person;

  @ManyToOne(() => Movie, (movie) => movie.cast)
  @JoinColumn({ name: "movie_id" })
  movie: Movie;
}