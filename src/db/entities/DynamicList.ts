import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./User";

@Entity()
export class DynamicList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;
  
  @Column()
  query: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: Relation<User>;
}