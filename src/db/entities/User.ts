import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, Unique, Relation } from "typeorm";
import { getSalt, hash, getRememberMeToken } from "../../lib/hashPassword";
import { Rating } from "./Rating";

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

  @Column({ nullable: true })
  letterboxdAccountLevel: 'basic' | 'pro' | 'patron';

  @ManyToOne(() => Rating, rating => rating.user)
  ratings: Relation<Rating[]>;

  @BeforeInsert()
  prepareUser() {
    const salt = getSalt();
    const hashedPassword = hash(this.password, salt);
    this.password = hashedPassword;
    this.salt = salt;

    if (this.rememberMe) {
      this.rememberMeToken = getRememberMeToken();
    }
  }
}

// user.email = options.email;
// user.name = options.letterboxd.name;
// user.letterboxdAccountLevel = options.letterboxd.accountLevel;
// user.avatarUrl = options.avatarUrl;
// user.username = options.letterboxd.username;