// used to represent "linked" groups
// Used to present a user on the service

// TODO: Have a look at eager relationships - some of these would probably suit being made Eager.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import ApiKey from "./ApiKey.entity";
import Integration from "./Integration.entity";
import User from "./User.entity";


@Entity()
export default class Group {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  robloxId: number;

  @Column({
    length: 30,
    unique: true
  })
  username: string;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  // TO consider;
  // If we want to add additional permissions the owner field could be replaced by a join table
  // With permission fields. One of those permissions could be ownership.
  @OneToMany(() => ApiKey, key => key.group)
  keys: ApiKey[];

  @OneToMany(() => Integration, integration => integration.group)
  integrations: Integration[];

  @ManyToMany(() => User, user => user.groups)
  @JoinTable()
  users: User[];

  // Possible problem: What happens when Group ownership is transferred?
  @ManyToOne(() => User, user => user.groups, { nullable: false })
  owner: User;
}
