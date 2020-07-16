import { Type } from "class-transformer";
import {
  IsBoolean, IsDate, IsNumber, IsPositive, IsUUID
} from "class-validator";

import { ApiKey, Integration, User } from "../../entities";
import Group from "../../entities/Group.entity";
import { RobloxGroup } from "../../types";
import { Bot } from "../BotController/types";
import { PartialIntegration } from "../IntegrationController/types";

export class PartialGroup implements Partial<Group> {
  @IsUUID("4")
  id: string;

  @IsPositive()
  robloxId: number;

  @IsBoolean()
  botActive: boolean;

  @IsDate()
  created: Date;

  robloxInfo?: RobloxGroup
}

export class FullGroup extends PartialGroup {
  // Make this a DTO too?
  @Type(() => ApiKey)
  keys: ApiKey[];

  // Make this a DTO?
  @Type(() => Integration)
  integrations: PartialIntegration[];

  @Type(() => User)
  owner: User;

  @Type(() => Bot)
  bot?: Bot
}

// Issue regarding validation of id in params: https://github.com/typestack/routing-controllers/issues/348
export class IdParam {
  @IsUUID("4")
  id: string
}

export class AddGroupBody {
  @IsNumber()
  @IsPositive()
  robloxId: number
}

export class UnlinkedGroup {
  name: string;

  id: number;

  emblemUrl: string;

  rank: number;

  role: string;
}
