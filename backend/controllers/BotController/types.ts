import {
  IsBoolean, IsDate, IsNumber, IsPositive, IsUUID, ValidateNested
} from "class-validator";

import { PartialGroup } from "../GroupController/types";

export class Bot {
  @IsUUID("4")
  id: string;

  @IsNumber()
  @IsPositive()
  robloxId: number;

  @IsDate()
  cookieUpdated: Date;

  @IsBoolean()
  dead: boolean;
}

export class QueueItem {
  @ValidateNested()
  group: PartialGroup;

  @ValidateNested()
  bot: Bot;
}
