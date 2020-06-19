import { PartialGroup } from "./Group";

export interface Bot {
  id: string;

  robloxId: number;

  username?: string;

  cookieUpdated: string;

  dead: boolean;
}

export interface QueueItem {
  group: PartialGroup;

  bot: Bot;
}

export interface UpdateBotBody {
  cookie?: string;

  dead?: boolean;
}
