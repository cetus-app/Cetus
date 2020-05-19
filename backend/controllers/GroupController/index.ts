import {
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  InternalServerError,
  JsonController,
  NotFoundError,
  Param,
  Params,
  Patch,
  Post
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";


import Roblox from "../../api/roblox/Roblox";
import database from "../../database";
import { Group, User } from "../../entities";
import { UserRobloxGroup } from "../../types";
import {
  AddGroupBody, FullGroup, GroupParam, PartialGroup, UnlinkedGroup
} from "./types";


@JsonController("/groups")
export default class Groups {
  @Get("/")
  @ResponseSchema(PartialGroup, { isArray: true })
  async getGroups (@CurrentUser({ required: true }) user: User): Promise<PartialGroup[]> {
    // Get user groups
    return database.users.getUserGroups(user);
  }


  // Begins the link process for a given group
  @OpenAPI({ description: "Begins the account link process for a given group." })
  @Post("/")
  @ResponseSchema(PartialGroup)
  async addGroup (@CurrentUser({ required: true }) user: User, @Body() { robloxId }: AddGroupBody): Promise<PartialGroup> {
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
    const existingGroup = await database.groups.getGroupByRoblox(robloxId);
    if (existingGroup) {
      // Check group owner
      if (existingGroup.owner.robloxId !== groupInfo.owner.id) {
        // Case 1: Current group is bound to someone else who no longer owns it
        // The new user does own it, so we update the group as such.
        existingGroup.owner = user;
        await database.groups.save(existingGroup);
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
      await database.groups.save(newGroup);
      delete newGroup.owner;
      return newGroup;
    }
  }

  @OpenAPI({ description: "Fetches the user's linkable groups (Owned by them & Not currently linked)" })
  @Get("/unlinked")
  @ResponseSchema(UnlinkedGroup, { isArray: true })
  async getUnlinked (@CurrentUser({ required: true }) user: User): Promise<UserRobloxGroup[]> {
    // TODO: Check their payment level & if they're allowed to add another one
    //  This isn't super critical, but it would be a good idea.
    if (user.robloxId) {
      const linkable:UserRobloxGroup[] = [];
      const groups = await Roblox.getUserGroups(user.robloxId);
      if (!groups) {
        throw new InternalServerError("Failed to get user's Roblox groups");
      }
      for (const group of groups) {
        // We don't get group.owner but if rank is 255, they must own it.
        if (group.rank === 255) {
          linkable.push(group);
        }
      }
      return linkable;
    }
    throw new BadRequestError("You must verify your Roblox account before you can do that.");
  }

  @Get("/:id")
  @ResponseSchema(FullGroup)
  async getGroup (@CurrentUser({ required: true }) user: User, @Params({
    required: true,
    validate: true
  }) { id }: GroupParam): Promise<FullGroup> {
    // Get specific group
    const grp = await database.groups.getFullGroup(id);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    // Check permissions
    if (grp.owner.id === user.id) {
      return grp;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }

  @OpenAPI({ description: "Modifies the state of the currently deployed bot, for example by notifying our server that it has been accepted into the group." })
  @Patch("/:groupId/bot")
  @ResponseSchema(Group)
  async updateBot (@CurrentUser({ required: true }) _user: User): Promise<any> {
    return false;
  }

  @OpenAPI({ description: "Removes a group and causes our bot account to leave." })
  @Delete("/:id")
  @ResponseSchema(Group)
  async removeGroup (@CurrentUser({ required: true }) user: User, @Param("id") { id }: GroupParam): Promise<boolean> {
    const grp = await database.groups.getFullGroup(id);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    // Check permissions
    if (grp.owner.id === user.id) {
      await database.groups.remove(grp);

      // TODO: Remove the bot from the group
      return true;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }
}
