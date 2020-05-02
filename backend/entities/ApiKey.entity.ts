// Represents an authentication token
import { Column, Entity, ManyToOne } from "typeorm";

import Group from "./Group.entity";
import Key from "./Key.abstract.entity";

@Entity()
export default class ApiKey extends Key {
  // A user inputted name for the key, so they can easily identify it
  @Column()
  name: string;

  @ManyToOne(() => Group, grp => grp.keys)
  group: Group;
}
