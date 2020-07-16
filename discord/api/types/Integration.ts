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

export interface AntiAdminAbuseConfig extends BaseIntegrationConfig {
  actionsPerMin: number;
}

export enum IntegrationType {
  discordBot = "DISCORD_BOT",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

export class PartialIntegration {
  id: string;

  type: IntegrationType;

  config: BaseIntegrationConfig;
}

export class DiscordIntegration extends PartialIntegration {
  config: DiscordBotConfig;
}
