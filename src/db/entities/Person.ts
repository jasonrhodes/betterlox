
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from "typeorm";
import { CastRole } from "./CastRole";
import { CrewRole } from "./CrewRole";

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  biography: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  deathday: Date;

  @Column({ nullable: true })
  gender: number;

  @Column({ nullable: true })
  imdbId: number;

  @Column({ nullable: true })
  knownForDepartment: string;

  @Column({ nullable: true })
  placeOfBirth: string;

  @Column({ nullable: true })
  popularity: number;

  @Column({ nullable: true })
  profilePath: string;

  @OneToMany(() => CastRole, (cast) => cast.actor)
  castRoles: Relation<CastRole[]>;

  @OneToMany(() => CrewRole, (crew) => crew.person)
  crewRoles: Relation<CrewRole[]>;
}
