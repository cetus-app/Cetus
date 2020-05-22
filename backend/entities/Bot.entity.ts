// Represents one of our Bot clients
import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";


@Entity()
export default class Bot {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: false,
    unique: true
  })
  robloxId: number;

  @Column({
    nullable: false,
    select: false,
    length: 700,
    unique: true
  })
  cookie: string;

  @Column({ type: "timestamptz" })
  cookieUpdated: Date;

@Column({
  nullable: false,
  default: false
})
  dead: boolean;
}
