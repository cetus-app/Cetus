import { IsUUID } from "class-validator";
import {
  CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, Param, Patch, Post
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import Group from "../entities/Group.entity";
import User from "../entities/User.entity";
import { groupRepository, userRepository } from "../repositories";

// Issue regarding validation of Group.id in params: https://github.com/typestack/routing-controllers/issues/348
class GroupParam {
  @IsUUID("4")
  id: string
}


@JsonController("/groups")
export default class GroupController {
  @Get("/")
  @ResponseSchema(Group, { isArray: true })
  async getGroups (@CurrentUser({ required: true }) user: User): Promise<Group[]> {
    // Get user groups
    return userRepository.getUserGroups(user);
  }


  // Begins the link process for a given group
  @OpenAPI({ description: "Begins the account link process for a given group." })
  @Post("/")
  @ResponseSchema(Group)
  async addGroup (@CurrentUser({ required: true }) user: User): Promise<Group> {
    // Check their payment level & if they're allowed to add another one

  }

  @OpenAPI({ description: "Fetches the user's linkable groups (Owned by them & Not currently linked)" })
  @Get("/unlinked")
  @ResponseSchema(Group)
  async getUnlinked (@CurrentUser({ required: true }) user: User): Promise<Group> {
    // Check their payment level & if they're allowed to add another one

  }

  @Get("/:id")
  @ResponseSchema(Group, { isArray: true })
  async getGroup (@CurrentUser({ required: true }) user: User, @Param("id") { id }: GroupParam): Promise<Group> {
    // Get specific group
    const grp = await groupRepository.findOne({ id });
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    // Check permissions
    if (grp.owner.id === user.id) {
      return grp;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }

  @OpenAPI({ description: "Fetches the user's linkable groups (Owned by them & Not currently linked)" })
  @Patch("/:groupId/bot")
  @ResponseSchema(Group)
  async updateBot (@CurrentUser({ required: true }) user: User): Promise<Group> {
    // Check their payment level & if they're allowed to add another one

  }

  @OpenAPI({ description: "Removes a group and causes our bot account to leave." })
  @Delete("/:groupId")
  @ResponseSchema(Group)
  async removeGroup (@CurrentUser({ required: true }) user: User): Promise<boolean> {
    // Check their payment level & if they're allowed to add another one

  }
}
