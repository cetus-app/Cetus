import { Request } from "express";
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
  Params,
  Patch,
  Post,
  Req
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import database from "../../database";
import { Group, User } from "../../entities";
import { UserRobloxGroup } from "../../types";
import { Bot } from "../BotController/types";
import {
  AddGroupBody, FullGroup, IdParam, PartialGroup, UnlinkedGroup
} from "./types";


@JsonController("/groups")
export default class Groups {
  @Get("/")
  @ResponseSchema(PartialGroup, { isArray: true })
  async getGroups (@CurrentUser({ required: true }) user: User): Promise<PartialGroup[]> {
    // Get user groups
    const groups: PartialGroup[] = await database.users.getUserGroups(user);
    if (!groups) {
      return [];
    }
    // Why? Makes them all run at once.
    const promises = [];
    for (let counter = 0; counter < groups.length; counter++) {
      promises.push(Roblox.getGroup(groups[counter].robloxId));
    }
    // TODO: Pass to sentry?
    promises.map(p => p.catch(e => { console.error(`Failed to get Roblox info for group ${e}`); return false; }));
    const resp = await Promise.all(promises);
    for (let counter = 0; counter < resp.length; counter++) {
      try {
        // If it failed it'll be false
        if (resp[counter]) {
          groups[counter].robloxInfo = resp[counter];
        }
      } catch (e) {
        console.error(`Failed to get Roblox info for group ${e}`);
      }
    }
    return groups;
  }


  // Begins the link process for a given group
  @OpenAPI({ description: "Begins the link process for a given group." })
  @Post("/")
  @ResponseSchema(PartialGroup)
  async addGroup (@CurrentUser({ required: true }) user: User, @Body() { robloxId }: AddGroupBody): Promise<PartialGroup> {
    // TODO: Check their payment level & if they're allowed to add another one

    // Get group info - Check owner
    const groupInfo = await Roblox.getGroup(robloxId);
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
      // TODO: Assign a bot
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
      // Check for already linked groups
      const ids = groups.map((group: UnlinkedGroup) => (group.id));

      const linked = await database.groups.getGroupsByRoblox(ids);
      for (const group of groups) {
        let isLinked = false;
        for (const item of linked) {
          if (item.robloxId === group.id) {
            isLinked = true;
            break;
          }
        }
        // We don't get group.owner but if rank is 255, they must own it.
        if (group.rank === 255 && !isLinked) {
          linkable.push(group);
        }
      }

      return linkable;
    }
    throw new BadRequestError("You must verify your Roblox account before you can do that.");
  }

  @Get("/:id")
  @ResponseSchema(FullGroup)
  async getGroup (@CurrentUser({ required: true }) _user: User,
                  @Params({
                    required: true,
                    validate: true
                  }) { id }: IdParam,
                  @Req() request: Request): Promise<FullGroup> {
    // Get specific group
    const group = await request.groupService.canAccessGroup(id);
    let p;
    if (group && group.bot) {
      p = Roblox.getUsernameFromId(group.bot.robloxId);
      p.catch(console.error);
    }
    const groupInfoPromise = Roblox.getGroup(group.robloxId);
    const groupRobloxInfo = await groupInfoPromise;

    const toSend:FullGroup = { ...group };

    if (p && group.bot) {
      const toSendBot:Bot = { ...group.bot };
      toSendBot.username = await p || undefined;
      toSend.bot = toSendBot;
    }
    toSend.robloxInfo = groupRobloxInfo;
    return toSend;
  }

  @OpenAPI({ description: "Modifies the state of the currently deployed bot, for example by notifying our server that it has been accepted into the group." })
  @Patch("/:groupId/bot")
  @ResponseSchema(Group)
  async updateBot (@CurrentUser({ required: true }) _user: User): Promise<any> {
    return false;
  }

  @OpenAPI({ description: "Removes a group and causes our bot account to leave." })
  @Delete("/:id")
  async removeGroup (@CurrentUser({ required: true }) user: User, @Params({
    required: true,
    validate: true
  }) { id }: IdParam): Promise<boolean> {
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
