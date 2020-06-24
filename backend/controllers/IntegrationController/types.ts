import { IsEnum, IsUUID } from "class-validator";

import { IntegrationType } from "../../entities/Integration.entity";

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
