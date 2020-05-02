// Used to present a user on the service
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";

import Auth from "./Auth.entity";
import Group from "./Group.entity";

@Entity()
export default class User {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

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

  @Column({
    type: "timestamptz",
    default: "NOW()"
  })
  created: Date;

  @OneToMany(() => Auth, auth => auth.user)
  auth: Auth[];

  @OneToMany(_type => Group, grp => grp.owner)
  groups: Group[];
}
