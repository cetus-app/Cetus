import {
  IsAscii,
  IsDate, IsString, IsUUID, MaxLength, MinLength
} from "class-validator";

import { PartialGroup } from "../GroupController/types";

export class ApiKeyRequest {
  @IsUUID("4")
  groupId: PartialGroup["id"];

  @IsString()
  @MaxLength(30)
  @IsAscii()
  name: string;
}

export class ApiKeyResponse {
  @IsUUID("4")
  id: string;

  @IsString()
  @MinLength(100)
  @MaxLength(100)
  token: string;

  @IsDate()
  created: Date;

  @IsString()
  @MaxLength(30)
  name: string;
}

export class DeleteKeyRequest {
  @IsUUID("4")
  id: string
}
