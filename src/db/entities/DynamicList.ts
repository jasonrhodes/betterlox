import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
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

  @ManyToOne(() => User)
  @JoinColumn()
  user: Relation<User>;
}