import {
  IsBoolean,
  IsDefined,
  IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsUrl, IsUUID, Max, Min
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
}

export const integrationConfig: {[key in IntegrationType]: (DiscordBotConfigBody|AntiAbuseConfigBody)} = {
  [IntegrationType.discordBot]: DiscordBotConfigBody,
  [IntegrationType.antiAdminAbuse]: AntiAbuseConfigBody
};


export const integrationDefault: {[key in IntegrationType]: (DiscordBotConfig|AntiAdminAbuseConfig)} = {
  [IntegrationType.discordBot]: { guildId: "aa" },
  [IntegrationType.antiAdminAbuse]: {
    actionTime: 5,
    demotionRank: 1,
    actionCount: 20,
    revert: false,
    enabled: true
  }
};


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
    longDesc: "Discord bot long description. Insert some long winded statement about all the features it supports and about how it's generally pretty amazing.\n\nNew line test",
    cost: 3
  },
  [IntegrationType.antiAdminAbuse]: {
    name: "Group defender",
    shortDesc: "Protect your group against admin abuse.",
    icon: "fas fa-shield-alt",
    longDesc: "Group defender gives you peace of mind. It consists of advanced software, running on our servers. It works by monitoring your group audit logs and detecting suspicious actions or users exceed the limits you set.\n\nWhat else can it do?\nGroup defender can detect, report and revert admin abuse to allow your group to continue functioning - with minimal disruption.",
    cost: 3
  }
};
