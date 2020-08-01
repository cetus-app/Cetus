import {
  ArrayUnique, IsEnum, IsNotEmpty, IsString, IsUUID
} from "class-validator";

import { IntegrationType } from "../../entities/Integration.entity";

export class SessionBody {
  @IsUUID("4")
  groupId: string;

  @IsEnum(IntegrationType, { each: true })
  @ArrayUnique()
  integrations: IntegrationType[]
}

export class SessionResponse {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class CompleteSubscriptionResponse {
  // Stripe webhook received acknowledgement (only a 2xx response is actually required)
  received: boolean;
}
