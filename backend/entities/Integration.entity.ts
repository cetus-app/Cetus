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

export interface BaseIntegrationConfig {}

export interface DiscordBotConfig extends BaseIntegrationConfig {
  guildId?: string;
  verifiedRoleId?: string;
  unverifiedRoleId?: string;
  binds: {
    roleId: string;
    rank: number;
    exclusive: boolean;
  }[]
}

export const defaultDiscordConfig: DiscordBotConfig = { binds: [] };

export interface AntiAdminAbuseConfig extends BaseIntegrationConfig {
  actionsPerMin: number;
}

export const defaultAntiAdminAbuseConfig: AntiAdminAbuseConfig = { actionsPerMin: 20 };

export enum IntegrationType {
  discordBot = "DISCORD_BOT",
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

  @Column({ type: "jsonb" })
  config: BaseIntegrationConfig;

  @ManyToOne(() => Group, grp => grp.integrations, { nullable: false })
  group: Group;
}
