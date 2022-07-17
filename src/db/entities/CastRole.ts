import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_cast')
export class CastRole extends BaseEntity {
  @PrimaryColumn()
  movieId: number;

  @PrimaryColumn()
  personId: number;

  @Column()
  castId: number;

  @Column({ nullable: true })
  character: string;

  @Column()
  castOrder: number;

  @Column()
  creditId: string;

  @ManyToOne(() => Person, (person) => person.castRoles)
  @JoinColumn({ name: "personId" })
  actor: Relation<Person>;

  @ManyToOne(() => Movie, (movie) => movie.cast)
  @JoinColumn({ name: "movieId" })
  movie: Relation<Movie>;
}