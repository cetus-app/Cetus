// Stores configuration data for any applicable integrations.
// may want to look at JSON fields or something as it's likely the shape of the data will vary by integration.
// An alternative would be to have a different entity for each integration, I guess?
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import Group from "./Group.entity";

export enum IntegrationType {
  promotionCentre = "PROMOTION_CENTRE",
  discordBot = "DISCORD_BOT",
  rankingAPI = "RANKING_API",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

@Entity()
export default class Integration {
  // UUID V4
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: IntegrationType
  })
  type: IntegrationType;

  @ManyToOne(() => Group, grp => grp.integrations, { nullable: false })
  group: Group;
}
