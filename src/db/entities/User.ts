import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, Unique, Relation, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { LetterboxdList } from ".";
import { getSalt, hash, getRememberMeToken } from "../../lib/hashPassword";
import { FilmEntry } from "./FilmEntry";
import { UserSettings } from "./UserSettings";

@Entity('users')
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column()
  rememberMe: boolean;

  @Column({ nullable: true })
  rememberMeToken: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  avatarUrl: string;

  @Column({ default: 'basic' })
  letterboxdAccountLevel: 'basic' | 'pro' | 'patron';

  @Column({ nullable: true })
  lastEntriesUpdate: Date;

  @Column({ nullable: true })
  lastLogin?: Date;

  @OneToOne(() => UserSettings, (settings) => settings.user, { eager: true, cascade: true })
  settings?: Relation<UserSettings>;

  @ManyToOne(() => FilmEntry, entry => entry.user)
  ratings: Relation<FilmEntry[]>;

  @ManyToMany(() => LetterboxdList, (list) => list.followers)
  @JoinTable()
  followedLists: Relation<LetterboxdList>[];

  @OneToMany(() => LetterboxdList, (list) => list.owner)
  ownedLists: Relation<LetterboxdList>[];

  @ManyToMany(() => LetterboxdList, (list) => list.trackers)
  @JoinTable()
  trackedLists: Relation<LetterboxdList>[];

  @BeforeInsert()
  hashUserPassword() {
    const salt = getSalt();
    const hashedPassword = hash(this.password, salt);

    this.password = hashedPassword;
    this.salt = salt;

    if (this.rememberMe) {
      this.rememberMeToken = getRememberMeToken();
    }
  }

  checkPassword(password: string) {
    return this.password === hash(password, this.salt);
  }
}