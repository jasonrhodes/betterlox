import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

@Entity()
export class LetterboxdList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true })
  url: string;

  @Column()
  letterboxdUsername: string;

  @Column({ nullable: true })
  letterboxdListId: number;

  @ManyToOne(() => User, (user) => user.ownedLists)
  owner: Relation<User>;

  @Column({ default: true })
  followable: boolean;

  @Column({ nullable: true })
  publishDate?: Date;

  @Column({ nullable: true })
  lastUpdated?: Date;

  @Column()
  lastSynced: Date;

  @Column({ default: 'public' })
  visibility: 'public' | 'private';

  @Column({ default: false })
  isRanked: boolean;

  @ManyToMany(() => User, (user) => user.followedLists)
  followers: Relation<User>[];

  @OneToMany(() => LetterboxdListMovieEntry, (entry) => entry.list, { cascade: true })
  movies: Relation<LetterboxdListMovieEntry>[];

  @ManyToMany(() => User, (user) => user.trackedLists)
  trackers: Relation<User>[];
}

@Entity()
@Unique('order_check', ['listId', 'movieId', 'order'])
export class LetterboxdListMovieEntry {
  @PrimaryColumn()
  listId: number;

  @PrimaryColumn()
  movieId: number;

  @Column({ nullable: true })
  order?: number;

  @ManyToOne(() => LetterboxdList, (list) => list.movies)
  @JoinColumn({
    name: 'listId',
    referencedColumnName: 'id'
  })
  list: Relation<LetterboxdList>;

  @ManyToOne(() => Movie, { createForeignKeyConstraints: false })
  @JoinColumn({
    name: 'movieId',
    referencedColumnName: 'id'
  })
  movie: Relation<Movie>;
}