import {
  ArrayUnique, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID
} from "class-validator";

import { IntegrationType } from "../../entities/Integration.entity";

export class SessionBody {
  @IsUUID("4")
  groupId: string;

  @IsEnum(IntegrationType, { each: true })
  @ArrayUnique()
  integrations: IntegrationType[]

  @IsString()
  @IsOptional()
  discountCode?: string
}

export class SessionResponse {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class CustomerPortalSessionResponse {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CompleteSubscriptionResponse {
  // Stripe webhook received acknowledgement (only a 2xx response is actually required)
  received: boolean;
}
