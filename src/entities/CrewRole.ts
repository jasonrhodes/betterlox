import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_crew')
export class CrewRole extends BaseEntity {
  @PrimaryColumn({ name: "movie_id" })
  movieId: number;

  @PrimaryColumn({ name: "person_id" })
  personId: number;

  @Column({ nullable: true })
  job: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: "credit_id" })
  creditId: string;

  @ManyToOne(() => Person, (person) => person.crewRoles)
  @JoinColumn({ name: "person_id" })
  person: Person;

  @ManyToOne(() => Movie, (movie) => movie.crew)
  @JoinColumn({ name: "movie_id" })
  movie: Movie;
}