import {
  IsArray,
  IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min
} from "class-validator";
import {
  Authorized, CurrentUser, JsonController, Param, Get,Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Group from "../entities/Group.entity";
import User from "../entities/User.entity";


class GetGroupsResonse {
  @IsBoolean()
  success: boolean;
  // TODO: Make this a data transfer object
  // Add validation?
  groups: Group[];
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
