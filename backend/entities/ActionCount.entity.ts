// Used for storing historical group action counts for analysis.
// These values are permanently stored.
import {
  Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn
} from "typeorm";


@Entity()
export default class ActionCount {
  // Action id is used purely because it needs a PK.
  // It is equal to the group id + the year + the month in a string-like style (Appended)
  // For example 123204 - Would be group 123, year 20, month 4. This is not intended to be queried:
  @PrimaryColumn({ type: "text" })
  actionId: string;

  // The group id
  @Column({ length: 50 })
  id: string;

  // The JS Date month number (0-11)
  @Column({ type: "smallint" })
  month: number;

  // The JS date getFullYear output
  @Column({ type: "smallint" })
  year: number;

  // The roblox id of this group at the time of recording
  // This is useful for cases where groups have been removed and the associated robloxId is no longer stored.
  @Column()
  robloxId: number;

  // The actual number of group altering requests made in this month
  @Column()
  count: number
}
