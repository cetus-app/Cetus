import {
  IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Length, ValidateNested
} from "class-validator";

import { PartialGroup } from "../GroupController/types";

export class Bot {
  @IsUUID("4")
  id: string;

  @IsNumber()
  @IsPositive()
  robloxId: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsDate()
  cookieUpdated: Date;

  @IsBoolean()
  dead: boolean;
}

export class AddBotBody {
  @IsNumber()
  @IsPositive()
  robloxId: number;

  @IsString()
  @Length(700, 700)
  cookie: string;
}

export class UpdateBotBody {
  @IsString()
  @Length(700, 700)
  @IsOptional()
  cookie?: string;

  @IsBoolean()
  @IsOptional()
  dead?: boolean;
}

export class QueueItem {
  @ValidateNested()
  group: PartialGroup;

  @ValidateNested()
  bot: Bot;
}
