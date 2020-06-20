import {
  InferType, number, object, string
} from "yup";

import { PartialGroup } from "./Group";

export interface Bot {
  id: string;

  robloxId: number;

  username?: string;

  cookieUpdated: string;

  dead: boolean;
}

export const addBotBody = object().required().shape({
  robloxId: number().required().positive().label("Roblox ID"),
  cookie: string().required().length(700).label("Cookie")
});

export type AddBotBody = InferType<typeof addBotBody>;

export interface UpdateBotBody {
  cookie?: string;

  dead?: boolean;
}

export interface QueueItem {
  group: PartialGroup;

  bot: Bot;
}
