import { PartialGroup } from "./Group";

export enum IntegrationType {
  promotionCentre = "PROMOTION_CENTRE",
  discordBot = "DISCORD_BOT",
  rankingAPI = "RANKING_API",
  antiAdminAbuse = "ANTI_ADMIN_ABUSE"
}

export default class Integration {
  id: string;

  type: IntegrationType;

  group: PartialGroup;
}
