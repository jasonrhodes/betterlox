import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, Relation, JoinColumn } from "typeorm";
import { User } from ".";

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @CreateDateColumn()
  created: Date;
}