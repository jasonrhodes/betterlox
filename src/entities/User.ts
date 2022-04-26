import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Rating } from "./Rating";

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({ nullable: true })
  rememberMeToken: string;

  @Column({ name: 'letterboxdUsername' })
  username: string;

  @Column({ name: "letterboxdName" })
  name: string;

  @Column({ nullable: true })
  letterboxdAccountLevel: 'basic' | 'pro' | 'patron';

  @ManyToOne(() => Rating, rating => rating.user)
  ratings: Rating[];
}