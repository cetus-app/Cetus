import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
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
  Req,
  UseAfter,
  UseBefore
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import { botGroupThreshold, FREE_REQUESTS } from "../../constants";
import database from "../../database";
import { Group, User } from "../../entities";
import { PermissionLevel } from "../../entities/User.entity";
import { csrfMiddleware } from "../../middleware/CSRF";
import { stripe } from "../../shared";
import validRobloxUsername from "../../shared/util/validRobloxUsername";
import { UserRobloxGroup } from "../../types";
import { Bot } from "../BotController/types";
import {
  AddGroupBody,
  AdminBodyParam,
  EnableBotResponse,
  FullGroup,
  GetAdminUserParam,
  GetAdminUserResponse,
  IdParam,
  PartialGroup,
  UnlinkedGroup
} from "./types";

// For /unlinked & /:id
function requestDropper (_request: Request, response: Response, next:NextFunction) {
  if (response.headersSent) {
    return undefined;
  }
  return next();
}


@JsonController("/groups")
@UseBefore(csrfMiddleware)
export default class Groups {
  @Get("/")
  @ResponseSchema(PartialGroup, { isArray: true })
  async getGroups (@CurrentUser({ required: true }) user: User): Promise<PartialGroup[]> {
    // Get user groups
    const groups: PartialGroup[] = await database.users.getUserGroups(user, true);
    if (!groups) {
      return [];
    }
    // Why? Makes them all run at once.
    const promises = [];
    const groupIds = [];
    for (let counter = 0; counter < groups.length; counter++) {
      promises.push(Roblox.getGroup(groups[counter].robloxId));
      groupIds.push(groups[counter].robloxId);
    }
    // TODO: Pass to sentry?
    promises.map(p => p.catch(e => { console.error(`Failed to get Roblox info for group ${e}`); return false; }));
    const iconsPromise = Roblox.getGroupsImage(groupIds);

    const resp = await Promise.all(promises);
    const icons = await iconsPromise;
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
    // Set emblemUrls
    for (const icon of icons) {
      for (const grp of groups) {
        if (grp.robloxId === icon.id) {
          if (grp.robloxInfo) {
            grp.robloxInfo.emblemUrl = icon.url;
          }
          break;
        }
      }
    }

    return groups;
  }


  // Begins the link process for a given group
  @OpenAPI({ description: "Begins the link process for a given group." })
  @Post("/")
  @ResponseSchema(PartialGroup)
  async addGroup (@CurrentUser({ required: true }) user: User, @Body() { robloxId }: AddGroupBody,
    @Req() { groupService }: Request): Promise<PartialGroup> {
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
      const newGroup = new Group();
      newGroup.robloxId = robloxId;
      newGroup.owner = user;

      // Assign a bot
      const bots = await database.bots.createQueryBuilder("bot")
        .select("bot.id", "id")
        .addSelect("COUNT(\"group\".id)", "groupCount")
        .addSelect("bot.robloxId", "robloxId")
        .addSelect("bot.dead", "dead")
        .leftJoin(Group, "group", "bot.id = \"group\".\"botId\"")
        .groupBy("bot.id")
        .getRawMany();

      // Parsing to int - https://github.com/typeorm/typeorm/issues/2708
      const bot = bots.find(b => parseInt(b.groupCount, 10) < botGroupThreshold);

      if (!bot) {
        Sentry.captureMessage(`No bots with less than ${botGroupThreshold} groups assigned are available. Group ${newGroup.id} is therefore missing bot. Please assign manually and create a new Roblox bot account`);
      }
      newGroup.bot = bot;
      await database.groups.save(newGroup);

      // Notify us
      await groupService.notifyDeploy(newGroup);


      delete newGroup.owner;
      return newGroup;
    }
  }

  @OpenAPI({ description: "Fetches the user's linkable groups (Owned by them & Not currently linked)" })
  @Get("/unlinked")
  @UseAfter(requestDropper)
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

      const iconsPromise = Roblox.getGroupsImage(ids);

      const linked = await database.groups.getGroupsByRoblox(ids);
      const icons = await iconsPromise;

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
          const icon = icons.find(i => i.id === group.id);
          group.emblemUrl = icon ? icon.url : "";
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
    // Drops it if we've already responded, like for unlinked
    // Get specific group
    const group = await request.groupService.canAccessGroup(id, undefined, true);
    let p;
    if (group && group.bot) {
      p = Roblox.getUsernameFromId(group.bot.robloxId);
      p.catch(console.error);
    }

    // Set up promises
    const groupInfoPromise = Roblox.getGroup(group.robloxId);
    const groupIconPromise = Roblox.getGroupsImage([group.robloxId]);
    const groupWithAdminsPromise = request.groupService.addAdminInfo(group);


    // Actually await them
    const groupRobloxInfo = await groupInfoPromise;
    const groupIcon = await groupIconPromise;

    const toSend:FullGroup = await groupWithAdminsPromise;

    if (!group.stripeSubscriptionId) {
      toSend.actionLimit = FREE_REQUESTS;
    }

    if (p && group.bot) {
      const toSendBot:Bot = { ...group.bot };
      toSendBot.username = await p || undefined;
      toSend.bot = toSendBot;
    }
    toSend.robloxInfo = groupRobloxInfo;

    if (toSend.robloxInfo && groupIcon[0] && groupIcon[0].url) {
      toSend.robloxInfo.emblemUrl = groupIcon[0].url;
    }

    return toSend;
  }

  @OpenAPI({ description: "Modifies the state of the currently deployed bot, for example by notifying our server that it has been accepted into the group." })
  @Patch("/:id/bot")
  @ResponseSchema(EnableBotResponse)
  async updateBot (@CurrentUser({ required: true }) user: User, @Params({
    required: true,
    validate: true
  }) { id }: IdParam,
    @Req() request: Request): Promise<EnableBotResponse> {
    let group;
    if (user.permissionLevel === PermissionLevel.admin) {
      group = await database.groups.findOne({ id }, { relations: ["bot"] });
    } else {
      group = await request.groupService.canAccessGroup(id, undefined, true);
    }
    if (!group) throw new NotFoundError("Group not found");

    if (!group.bot) throw new BadRequestError("Group has no assigned bot");

    // Check it's in the group and has permissions
    const client = await Roblox.getClient(group.id);
    const perms = await client.getPermissions(group.bot.robloxId);
    if (!perms) {
      throw new BadRequestError(`The bot is not in the Roblox group.`);
    } else if (!perms.changeRank) {
      throw new BadRequestError("The bot must have permission to change ranks.");
    }
    group.botActive = true;

    await database.groups.save(group);

    return {
      bot: group.bot,
      permissions: perms
    };
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
      if (grp.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.del(grp.stripeSubscriptionId);
        } catch (e) {
          console.error(e);
          throw new InternalServerError("Error occurred while cancelling subscription. Please contact support if the issue persists");
        }
      }

      await database.groups.remove(grp);

      // TODO: Remove the bot from the group
      return true;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }

  /**
   * Used prior to adding an admin. Gets their Cetus ID, and roblox info so the user can confirm their choice.
   */
  @OpenAPI({ description: "Fetches a Cetus id from Roblox information and returns Roblox info. The first step of adding an admin." })
  @Get("/admins/:idOrUsername")
  @ResponseSchema(GetAdminUserResponse)
  async getAdmin (@CurrentUser({ required: true }) _user: User, @Params({
    required: true,
    validate: true
  }) { idOrUsername }: GetAdminUserParam): Promise<GetAdminUserResponse> {
    // Parse adminValue
    let userId: number;
    const parsedValue = parseInt(idOrUsername, 10);
    // it's a username
    if (isNaN(parsedValue)) {
      if (validRobloxUsername(idOrUsername)) {
        const robloxId = await Roblox.getIdFromUsername(idOrUsername);
        if (robloxId) {
          userId = robloxId;
        } else {
          throw new BadRequestError("Couldn't find a user with that username");
        }
      } else {
        throw new BadRequestError("Invalid Roblox username");
      }
    } else if (parsedValue < 0) {
      throw new BadRequestError("Invalid user id");
    } else {
      // They've supplied a valid numerical id.
      userId = parsedValue;
    }

    // Get username & picture from id
    // We don't use the supplied username because it might be incorrect capitalised (and they might've supplied an id)
    const usernamePromise = Roblox.getUsernameFromId(userId);
    const imagePromise = Roblox.getUserImage(userId);

    const [username, image] = await Promise.all([usernamePromise, imagePromise]);
    if (!username || !image) {
      throw new Error("Couldn't find that user on Roblox.");
    }

    // Try to find a user
    const admin = await database.users.getUserByRId(userId);
    // Admin validation
    if (!admin) {
      throw new NotFoundError("User does not have an account on our service.");
    }
    return {
      id: admin.id,
      robloxInfo: {
        username,
        id: userId,
        image
      }
    };
  }

  // Actually adds the admin by their cetus id.
  @OpenAPI({ description: "Adds a new Admin user to your group." })
  @Post("/:id/admins")
  @ResponseSchema(FullGroup)
  async addAdmin (@CurrentUser({ required: true }) user: User, @Params({
    required: true,
    validate: true
  }) { id }: IdParam, @Body({
      required: true,
      validate: true
    }) { userId } : AdminBodyParam,
    @Req() request: Request): Promise<FullGroup> {
    const grp = await database.groups.getFullGroup(id);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    if (grp.admins.length >= 10) {
      throw new BadRequestError("To prevent abuse, we do not allow you to add more than 10 admins to your group.");
    }

    const admin = await database.users.getUser(userId);
    // Admin validation
    if (!admin) {
      throw new NotFoundError("User not found");
    } else if (grp.admins.find(u => u.id === admin.id)) {
      throw new BadRequestError("That user is already an admin.");
    } else if (grp.owner.id === admin.id) {
      throw new BadRequestError("You cannot add the owner as an admin.");
    }

    // Check permissions
    if (grp.owner.id === user.id) {
      grp.admins.push(admin);
      await database.groups.save(grp);

      return request.groupService.addAdminInfo(grp);
    }
    throw new ForbiddenError("Only the group owner can add group admins.");
  }


  @OpenAPI({ description: "Removes an admin user from your group." })
  @Delete("/:id/admins")
  @ResponseSchema(FullGroup)
  async rmvAdmin (@CurrentUser({ required: true }) user: User, @Params({
    required: true,
    validate: true
  }) { id }: IdParam, @Body({
      required: true,
      validate: true
    }) { userId } : AdminBodyParam,
    @Req() request: Request): Promise<FullGroup> {
    const grp = await database.groups.getFullGroup(id);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    const admin = await database.users.getUser(userId);
    if (!admin) {
      throw new NotFoundError("User not found");
    }

    const adminLocation = grp.admins.findIndex(u => u.id === admin.id);
    // Admin validation
    if (adminLocation === -1) {
      throw new BadRequestError("That user is not an admin.");
    } else if (grp.owner.id === admin.id) {
      throw new BadRequestError("You cannot add remove the owner as an admin.");
    }

    // Check permissions
    if (grp.owner.id === user.id) {
      grp.admins.splice(adminLocation, 1);
      await database.groups.save(grp);

      return request.groupService.addAdminInfo(grp);
    }
    throw new ForbiddenError("Only the group owner can remove group admins.");
  }
}
