// used to represent "linked" groups
// At present we're only implementing Owners. Additional users will be implemented
// Using Permissions in future.

// TODO: Have a look at eager relationships - some of these would probably suit being made Eager.
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import ApiKey from "./ApiKey.entity";
import Bot from "./Bot.entity";
import Integration from "./Integration.entity";
import User from "./User.entity";

// Enum to open opportunities for expanding in the future
export enum Subscription {
  basic = "BASIC"
}

@Entity()
export default class Group {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  robloxId: number;

  @Column({
    type: "enum",
    nullable: true,
    enum: Subscription
  })
  subscription?: Subscription;

  @Column("boolean", { default: false })
  // Partial index as per https://stackoverflow.com/a/42972924/6090379
  // Few groups will have `false`
  @Index({ where: "\"botActive\" = FALSE" })
  botActive: boolean;

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
  bot?: Bot;
}
