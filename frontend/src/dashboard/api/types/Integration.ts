import { PartialGroup } from "./Group";

export enum IntegrationType {
  discordBot = "DISCORD_BOT",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

export interface BaseIntegrationConfig {}

export class PartialIntegration {
  id: string;

  type: IntegrationType;

  group: PartialGroup;

  config: AntiAdminAbuseConfig | DiscordBotConfig;
}

export interface AntiAdminAbuseConfig {
  actionCount: number;
  actionTime: number;
  webhook?: string;
  // 0 = Do not demote; Anything above that = Demote.
  demotionRank: number
  revert: boolean,
  enabled: boolean
}

export interface DiscordBotConfig extends BaseIntegrationConfig {
  guildId?: string;
}

export interface IntegrationInfo {
  name: string,
  shortDesc: string,
  icon: string,
  longDesc: string,
  // Used in client only
  type?: string,
  cost: number
}

export type IntegrationMeta = {[key in IntegrationType]: IntegrationInfo}
