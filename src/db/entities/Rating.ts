import { BaseEntity, Entity, PrimaryColumn, Column, ManyToOne, Relation, JoinColumn } from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

@Entity("ratings")
export class Rating extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  movieId: number;

  @Column({ type: "float" })
  stars: number;

  @Column()
  date: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  year: number;

  @ManyToOne(() => Movie, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'movieId' })
  movie: Relation<Movie>;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
}