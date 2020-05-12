import { Type } from "class-transformer";
import {
  IsDate, IsNumber, IsPositive, IsUUID
} from "class-validator";

import { ApiKey, Integration, User } from "../../entities";

export class PartialGroup {
  @IsUUID("4")
  id: string;

  @IsPositive()
  robloxId: number;

  @IsDate()
  created: Date;
}

export class FullGroup extends PartialGroup {
  // Make this a DTO too?
  @Type(() => ApiKey)
  keys: ApiKey[];

  // Make this a DTO?
  @Type(() => Integration)
  integrations: Integration[];

  @Type(() => User)
  owner: User;
}

// Issue regarding validation of Group.id in params: https://github.com/typestack/routing-controllers/issues/348
export class GroupParam {
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
