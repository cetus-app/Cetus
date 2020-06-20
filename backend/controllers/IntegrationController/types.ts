import { IsEnum, IsString, IsUUID } from "class-validator";

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

  // We never actually validate this
  @IsString({ each: true })
  meta?: string[]
}
export class AddIntegrationBody {
  @IsEnum(IntegrationType)
  type: IntegrationType;
}
export const integrationMeta: {[key in IntegrationType]: string[]} = {
  [IntegrationType.discordBot]: ["Discord Bot", "Power up your Server and get powerful commands and features.", "fab fa-discord"],
  [IntegrationType.antiAdminAbuse]: ["Group defender", "Protect your group against admin abuse.", "fas fa-shield-alt"],
  [IntegrationType.api]: ["API Access", "Enable access to the API for your Group for external use.", "fas fa-robot"]
};
