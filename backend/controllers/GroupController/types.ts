import { IsNumber, IsUUID, Min } from "class-validator";

import { ApiKey, Integration, User } from "../../entities";

export class PartialGroup {
  id: string;

  robloxId: number;

  created: Date;
}

export class FullGroup extends PartialGroup {
  // Make this a DTO too?
  keys: ApiKey[];

  // Make this a DTO?
  integrations: Integration[];

  owner: User;
}

// Issue regarding validation of Group.id in params: https://github.com/typestack/routing-controllers/issues/348
export class GroupParam {
  @IsUUID("4")
  id: string
}

export class addGroupBody {
  @IsNumber()
  @Min(0)
  robloxId: number
}
