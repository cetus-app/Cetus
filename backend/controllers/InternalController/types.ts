import { Allow, IsEnum, IsUUID } from "class-validator";

import { Bot } from "../../entities";
import Group from "../../entities/Group.entity";
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
export class NotificationBody {
  @IsEnum(NotifcationType)
  type: NotifcationType;

  @Allow()
  data?: WebhookError|Activation;

  @IsUUID("4")
  groupId: Group["id"];
}
