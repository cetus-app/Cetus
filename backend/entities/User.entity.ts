// Used to present a user on the service
import {
  Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn
} from "typeorm";

import Auth from "./Auth.entity";
import Group from "./Group.entity";

@Entity()
export default class User {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int", {
    nullable: true,
    unique: true
  })
  rId?: number;

  @Column({
    length: 30,
    unique: true
  })
  username: string;


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

  @Column()
  emailVerified: boolean;

  @Column()
  robloxId?: number;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @OneToMany(() => Auth, auth => auth.user)
  auth: Auth[];

  @ManyToMany(() => Group, grp => grp.owner)
  groups: Group[];
}
