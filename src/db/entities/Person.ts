
import { Entity, Column, OneToMany, Relation, PrimaryColumn } from "typeorm";
import { CastRole } from "./CastRole";
import { CrewRole } from "./CrewRole";

@Entity('people')
export class Person {
  @PrimaryColumn()
  id: number; // tmdb ID

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
  imdbId: string;

  @Column({ nullable: true })
  knownForDepartment: string;

  @Column({ nullable: true })
  placeOfBirth: string;

  @Column({ nullable: true, type: "float" })
  popularity: number;

  @Column({ nullable: true })
  profilePath: string;

  @OneToMany(() => CastRole, (cast) => cast.actor)
  castRoles: Relation<CastRole[]>;

  @OneToMany(() => CrewRole, (crew) => crew.person)
  crewRoles: Relation<CrewRole[]>;
}
