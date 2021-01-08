import { Type } from "class-transformer";
import {
  IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength
} from "class-validator";

import { ApiKey, Integration, User } from "../../entities";
import Group from "../../entities/Group.entity";
import { GroupPermissions, RobloxGroup, RobloxUser } from "../../types";
import { PartialRobloxUser } from "../AccountController/types";
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

  robloxInfo?: RobloxGroup;

  @IsNumber()
  @IsPositive()
  actionCount: number
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
  bot?: Bot;

  @IsOptional()
  @IsNumber()
  actionLimit?: number;

  @Type(() => User)
  admins: any[];
}

// Issue regarding validation of id in params: https://github.com/typestack/routing-controllers/issues/348
export class IdParam {
  @IsUUID("4")
  id: string
}

export class GetAdminUserParam {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  idOrUsername: string
}
export class GetAdminUserResponse {
  @IsUUID("4")
  id: string

  @Type(() => PartialRobloxUser)
  robloxInfo: PartialRobloxUser
}

// Used to add or remove an admin
export class AdminBodyParam {
  @IsUUID("4")
  userId: string
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
export class EnableBotResponse {
  bot: Bot

  permissions: GroupPermissions
}
