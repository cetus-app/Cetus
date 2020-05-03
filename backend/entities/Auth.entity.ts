// Represents an authentication token
import { Entity, ManyToOne } from "typeorm";

import Key from "./Key.abstract.entity";
import User from "./User.entity";

@Entity()
export default class Auth extends Key {
  @ManyToOne(() => User, user => user.auth, { nullable: false })
  user: User;
}
