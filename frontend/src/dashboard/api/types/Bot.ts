import { PartialGroup } from "./Group";

export interface Bot {
  id: string;

  robloxId: number;

  username?: string;

  cookieUpdated: Date;

  dead: boolean;
}

export class QueueItem {
  group: PartialGroup;

  bot: Bot;
}
