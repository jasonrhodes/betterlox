import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from "typeorm";
import { User } from "."

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn()
  user?: Relation<User>;

  @Column({ default: 3 })
  statsMinWatched: number;
  
  @Column({ default: 10 })
  statsMinCastOrder: number;
}