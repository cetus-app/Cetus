import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUrl, IsUUID, Max, Min, ValidateIf, ValidateNested
} from "class-validator";

import { AntiAdminAbuseConfig, DiscordBotConfig, IntegrationType } from "../../entities/Integration.entity";

export class IdParam {
  @IsUUID("4")
  id: string;
}

export class GroupIdParam {
  @IsUUID("4")
  groupId: string;
}

export class IntegrationTypeParam {
  @IsEnum(IntegrationType)
  type: IntegrationType;
}

export class PartialIntegration {
  @IsUUID("4")
  id: string;

  @IsEnum(IntegrationType)
  type: IntegrationType;
}
export class AddIntegrationBody {
  @IsEnum(IntegrationType)
  type: IntegrationType;
}
// TODO: Look at Schema for docs? (We custom validate but docs need schema)
export class EditIntegrationBody {
  @IsDefined()
  @IsObject()
  config: AntiAbuseConfigBody|DiscordBotConfigBody
}

export class AntiAbuseConfigBody {
  @IsUrl()
  @IsOptional()
  @ValidateIf(body => body.webhook !== "")
  webhook?: string

  @IsNumber()
  @IsPositive()
  actionCount: number;

  // Min is 5 because we only scan once every 5 minutes.
  @IsNumber()
  @Min(5)
  actionTime: number;

  // 0 = Do not demote; Anything above that = Demote.
  @IsNumber()
  @Min(0)
  @Max(200)
  demotionRank: number

  @IsBoolean()
  revert: boolean

  @IsBoolean()
  enabled: boolean
}

export class DiscordBotConfigBody {
  @IsString()
  @IsOptional()
  verifiedRoleId?: string;

  @IsString()
  @IsOptional()
  unverifiedRoleId?: string;

  @IsString()
  @IsOptional()
  prefix?: string;

  @ValidateNested({ each: true })
  @Type(() => DiscordBotConfigBindsBody)
  binds: DiscordBotConfigBindsBody[]
}

export class DiscordBotConfigBindsBody {
  @IsString()
  roleId: string;

  @IsNumber()
  rank: number;

  @IsBoolean()
  exclusive: boolean;

  @IsNumber()
  @IsOptional()
  groupId?: number;
}

export const integrationConfig: {[key in IntegrationType]: (typeof DiscordBotConfigBody|typeof AntiAbuseConfigBody)} = {
  [IntegrationType.discordBot]: DiscordBotConfigBody,
  [IntegrationType.antiAdminAbuse]: AntiAbuseConfigBody
};


export const integrationDefault: {[key in IntegrationType]: (DiscordBotConfig|AntiAdminAbuseConfig)} = {
  [IntegrationType.discordBot]: { binds: [] },
  [IntegrationType.antiAdminAbuse]: {
    actionTime: 5,
    demotionRank: 1,
    actionCount: 20,
    revert: false,
    enabled: true
  }
};


export class UpdateIntegrationBody {
  @IsDefined()
  @IsObject()
  config: AntiAbuseConfigBody|DiscordBotConfigBody
}

// Separated out for clarity
interface IntegrationInfo {
  name: string,
  shortDesc: string,
  icon: string,
  longDesc: string,
  cost: number
}
export const integrationMeta: {[key in IntegrationType]: IntegrationInfo} = {
  [IntegrationType.discordBot]: {
    name: "Discord Bot",
    shortDesc: "Power up your Server and get powerful commands and features.",
    icon: "fab fa-discord",
    longDesc: "Our Discord bot will make your life as a server admin easier. Verify users, synchronise roles, send shouts and manage group members from simple commands in one place.\n\nThe bot is frequently updated with new features to simplify your group management.",
    cost: 5
  },
  [IntegrationType.antiAdminAbuse]: {
    name: "Group defender",
    shortDesc: "Protect your group against admin abuse.",
    icon: "fas fa-shield-alt",
    longDesc: "Group defender gives you peace of mind. It consists of advanced software, running on our servers. It works by monitoring your group audit logs and detecting suspicious actions or users exceed the limits you set.\n\nWhat else can it do?\nGroup defender can detect, report and revert admin abuse to allow your group to continue functioning - with minimal disruption.",
    cost: 5
  }
};
