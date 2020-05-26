// Used to present a user on the service
import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";

import Auth from "./Auth.entity";
import Group from "./Group.entity";

export enum PermissionLevel {
  user,
  admin
}

@Entity()
export default class User {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int", {
    nullable: true,
    unique: true
  })
  robloxId?: number;

  // The Bcrypt hash of the password. These are always 60 characters long.
  @Column({
    length: 60,
    select: false
  })
  hash: string;

  @Column({
    length: 50,
    unique: true
    /* select: false */
  })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @OneToMany(() => Auth, auth => auth.user)
  auth: Auth[];

  @OneToMany(() => Group, grp => grp.owner)
  groups: Group[];

  @Column({
    type: "enum",
    enum: PermissionLevel,
    default: PermissionLevel.user
  })
  permissionLevel: PermissionLevel
}
