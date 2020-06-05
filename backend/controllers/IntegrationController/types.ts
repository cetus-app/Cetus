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
