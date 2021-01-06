// Used to present a user on the service
import {
  Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn
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

  @Column("bigint", {
    nullable: true,
    unique: true
  })
  robloxId?: number;

  @Column("text", {
    nullable: true,
    unique: true
  })
  discordId?: string;

  @Column("text", {
    nullable: true,
    unique: true,
    select: false
  })
  stripeCustomerId?: string;

  // The Bcrypt hash of the password. These are always 60 characters long.
  @Column({
    length: 60,
    select: false,
    nullable: true
  })
  hash?: string;

  @Column({
    length: 50,
    unique: true,
    select: false
  })
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @OneToMany(() => Auth, auth => auth.user, { onDelete: "CASCADE" })
  auth: Auth[];

  @OneToMany(() => Group, grp => grp.owner, { onDelete: "CASCADE" })
  groups: Group[];

  // Groups this user has access to, but is not the owner of.
  @ManyToMany(() => Group, group => group.admins, { nullable: false })
  sharedGroups: Group[];

  @Column({
    type: "enum",
    enum: PermissionLevel,
    default: PermissionLevel.user
  })
  permissionLevel: PermissionLevel
}
