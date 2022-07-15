import { BaseEntity, Entity, PrimaryColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

@Entity("ratings")
export class Rating extends BaseEntity {
  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @PrimaryColumn({ name: "movie_id" })
  movieId: number;

  @Column({ type: "float" })
  rating: number;

  @Column()
  date: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  year: number;

  @ManyToOne(() => Movie, (movie) => movie.ratings)
  movie: Movie;

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;
}