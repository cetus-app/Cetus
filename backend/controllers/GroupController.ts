import {
  IsNumber, IsUUID, Max, Min
} from "class-validator";
import {
  BadRequestError,
  Body,
  CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, Param, Patch, Post
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import {
  Column, CreateDateColumn, ManyToOne, OneToMany
} from "typeorm";

import Roblox from "../api/roblox/Roblox";
import ApiKey from "../entities/ApiKey.entity";
import Group from "../entities/Group.entity";
import Integration from "../entities/Integration.entity";
import User from "../entities/User.entity";
import { groupRepository, userRepository } from "../repositories";

// Issue regarding validation of Group.id in params: https://github.com/typestack/routing-controllers/issues/348
class GroupParam {
  @IsUUID("4")
  id: string
}

class addGroupBody {
  @IsNumber()
  @Min(0)
  robloxId: number
}

class PartialGroup {
  id: string;

  robloxId: number

  created: Date;


}

class FullGroup extends PartialGroup {
  // Make this a DTO too?
  keys: ApiKey[];

  // Make this a DTO?
  integrations: Integration[];

  owner: User;
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
  async addGroup (@CurrentUser({ required: true }) user: User, @Body() { robloxId }: addGroupBody): Promise<PartialGroup> {
    // TODO: Check their payment level & if they're allowed to add another one

    // Get group info - Check owner
    const groupInfo = await Roblox.getGroupInfo(robloxId);
    if (!groupInfo) {
      throw new BadRequestError("Invalid Roblox group id");
    }
    // This would also error if the user hasn't yet verified their account
    if (groupInfo.owner.id !== user.robloxId) {
      throw new ForbiddenError("You cannot add a group you do not own.");
    }

    // Check if the group already exists in our system
    const existingGroup = await groupRepository.getGroupByRoblox(robloxId);
    if (existingGroup) {
      // Check group owner
      if (existingGroup.owner.robloxId !== groupInfo.owner.id) {
        // Case 1: Current group is bound to someone else who no longer owns it
        // The new user does own it, so we update the group as such.
        existingGroup.owner = user;
        await groupRepository.save(existingGroup);
        delete existingGroup.owner;
        return existingGroup;
      }

      // Current owner owns it
      throw new BadRequestError("Group is already registered");
    } else {
      // Register it
      const newGroup = new Group();
      newGroup.robloxId = robloxId;
      newGroup.owner = user;
      await groupRepository.save(newGroup);
      delete newGroup.owner;
      return newGroup;
    }
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
