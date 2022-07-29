import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, Relation, JoinColumn, ManyToOne } from "typeorm";
import { User } from ".";

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @CreateDateColumn()
  created: Date;
}