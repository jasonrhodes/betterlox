import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_crew')
export class CrewRole extends BaseEntity {
  @PrimaryColumn()
  movieId: number;

  @PrimaryColumn()
  personId: number;

  @Column({ nullable: true })
  job: string;

  @Column({ nullable: true })
  department: string;

  @Column()
  creditId: string;

  @ManyToOne(() => Person, (person) => person.crewRoles)
  @JoinColumn({ name: "personId" })
  person: Relation<Person>;

  @ManyToOne(() => Movie, (movie) => movie.crew)
  @JoinColumn({ name: "movieId" })
  movie: Relation<Movie>;
}