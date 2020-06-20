import { PartialGroup } from "./Group";

export enum IntegrationType {
  discordBot = "DISCORD_BOT",
  api = "API",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

export default class Integration {
  id: string;

  type: IntegrationType;

  group: PartialGroup;

  meta?: string[]
}