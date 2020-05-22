// used to represent "linked" groups
// At present we're only implementing Owners. Additional users will be implemented
// Using Permissions in future.

// TODO: Have a look at eager relationships - some of these would probably suit being made Eager.
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import ApiKey from "./ApiKey.entity";
import Bot from "./Bot.entity";
import Integration from "./Integration.entity";
import User from "./User.entity";


@Entity()
export default class Group {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  robloxId: number;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @OneToMany(() => ApiKey, key => key.group)
  keys: ApiKey[];

  @OneToMany(() => Integration, integration => integration.group)
  integrations: Integration[];

  // Possible problem: What happens when Group ownership is transferred?
  @ManyToOne(() => User, user => user.groups, { nullable: false })
  owner: User;

  @ManyToOne(() => Bot)
  bot: Bot;
}
