
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CastRole } from "./CastRole";
import { CrewRole } from "./CrewRole";

@Entity('people')
export class Person extends BaseEntity {
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

  @Column({ nullable: true, name: "imdb_id" })
  imdbId: number;

  @Column({ nullable: true, name: "known_for_department" })
  knownForDepartment: string;

  @Column({ nullable: true, name: "place_of_birth" })
  placeOfBirth: string;

  @Column({ nullable: true })
  popularity: number;

  @Column({ nullable: true, name: "profile_path" })
  profilePath: string;

  @OneToMany(() => CastRole, (cast) => cast.actor)
  castRoles: CastRole[];

  @OneToMany(() => CrewRole, (crew) => crew.person)
  crewRoles: CrewRole[];
}
