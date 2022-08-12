import { Entity, Column, ManyToOne, JoinColumn, Relation, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_cast')
export class CastRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @Column()
  personId: number;

  @Column({ default: false })
  personUnsyncable: boolean;

  @Column()
  castId: number;

  @Column({ nullable: true })
  character: string;

  @Column()
  castOrder: number;

  @Column({ unique: true })
  creditId: string;

  @ManyToOne(() => Person, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "personId" })
  actor: Relation<Person>;

  @ManyToOne(() => Movie, (movie) => movie.cast)
  @JoinColumn({ name: "movieId" })
  movie: Relation<Movie>;
}