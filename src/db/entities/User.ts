import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, Unique, Relation, BeforeUpdate } from "typeorm";
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