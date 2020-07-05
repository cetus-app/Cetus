import { PartialGroup } from "./Group";

export enum IntegrationType {
  discordBot = "DISCORD_BOT",
  api = "API",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

export interface BaseIntegrationConfig {}

export interface DiscordBotConfig extends BaseIntegrationConfig {
  guildId: string;
}

export interface AntiAdminAbuseConfig extends BaseIntegrationConfig {
  actionsPerMin: number;
}

export class PartialIntegration {
  id: string;

  type: IntegrationType;

  config: BaseIntegrationConfig;

  group: PartialGroup;
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
