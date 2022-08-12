import { BaseEntity, Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Relation, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./Movie";
import { Person } from "./Person";

@Entity('join_movies_crew')
export class CrewRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @Column()
  personId: number;

  @Column({ default: false })
  personUnsyncable: boolean;

  @Column({ nullable: true })
  job: string;

  @Column({ nullable: true })
  department: string;

  @Column({ unique: true })
  creditId: string;

  @ManyToOne(() => Person, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "personId" })
  person: Relation<Person>;

  @ManyToOne(() => Movie, (movie) => movie.crew)
  @JoinColumn({ name: "movieId" })
  movie: Relation<Movie>;
}