import { Entity, Column, PrimaryColumn, BeforeUpdate, BeforeInsert, OneToOne, Relation, JoinColumn } from "typeorm";
import { Movie } from "./Movie";

@Entity('popular_letterboxd_movies')
// @Unique('UQ_ID', ['type', 'itemId'])
export class PopularLetterboxdMovie {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  averageRating?: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  letterboxdSlug?: string;

  @Column()
  dateUpdated: Date;

  @Column({ default: false })
  unsyncable: boolean;

  @OneToOne(() => Movie, { eager: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  movie: Relation<Movie>;

  @BeforeUpdate()
  setDateUpdated() {
    this.dateUpdated = new Date();
  }

  @BeforeInsert()
  onInsert() {
    this.setDateUpdated();
  }
}