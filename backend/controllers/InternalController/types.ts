import { IsUUID } from "class-validator";

import { Bot } from "../../entities";
import Integration from "../../entities/Integration.entity";
import { PartialGroup } from "../GroupController/types";

export class InternalGroup extends PartialGroup {
  bot: Bot
}
export enum NotifcationType {
  scanError,
  webhookError,
  activation,
}

export interface Activation {
  username: string
  userId: number,
  demoted: boolean,
  reverted: number
  rank: string
}


export interface WebhookError {
  message: string,
  status: number
}
// no validation because it's internal anyway and we'd need to duplicate our interfaces into classes, and it isn't worth it.
export class NotificationBody {
  type: NotifcationType;

  data?: WebhookError|Activation;

  @IsUUID("4")
  groupId: Integration["id"];
}
