import { IsBoolean } from "class-validator";
import {
  Authorized, CurrentUser, Get, JsonController
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import {
  Column, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm";

import ApiKey from "../entities/ApiKey.entity";
import Group from "../entities/Group.entity";
import Integration from "../entities/Integration.entity";
import User from "../entities/User.entity";


class GetGroupsResonse {
  @IsBoolean()
  success: boolean;

  // TODO: Make this a data transfer object
  // Add validation?
  groups: Group[];
}

class GroupDTO {
  id: string;

  robloxId: number;

  username: string;

  created: Date;

  owner: User;
}


class AddGroupResponse {
  @IsBoolean()
  success: boolean;

  group: GroupDTO;
}

@JsonController("/groups")
export default class GroupController {
  @Get("/")
  @ResponseSchema(GetGroupsResonse)
  @Authorized()
  async getGroups (@CurrentUser({ required: true }) user: User): Promise<GetGroupsResonse> {
    // Get user groups
  // Needs the database service.. RIP.
  }
}
