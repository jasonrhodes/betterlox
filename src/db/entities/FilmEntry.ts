import { Entity, Column, Relation, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

@Entity("film_entries")
export class FilmEntry {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  movieId: number;

  @Column({ nullable: true, type: "float" })
  stars?: number;

  // @Column({ nullable: true })
  // dateRated?: Date;

  @Column({ nullable: true })
  date?: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  letterboxdSlug: string;

  @Column({ default: false })
  heart?: boolean;

  @Column({ nullable: true })
  rewatch?: boolean;

  @Column({ default: false })
  unsyncable: boolean;

  @ManyToOne(() => Movie, {
    createForeignKeyConstraints: false,
    eager: true
  })
  movie: Relation<Movie>;

  @ManyToOne(() => User, (user) => user.ratings, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
}
