import {
  Authorized, BadRequestError, Body, Get, JsonController, NotFoundError, Param, Patch, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import database from "../../database";
import { Bot } from "../../entities";
import { PermissionLevel } from "../../entities/User.entity";
import {
  AddBotBody, Bot as BotDTO, QueueItem, UpdateBotBody
} from "./types";

@JsonController("/bots")
export default class Bots {
  @Get("/")
  @ResponseSchema(BotDTO, { isArray: true })
  @Authorized(PermissionLevel.admin)
  async bots (): Promise<BotDTO[]> {
    const bots = await database.bots.find();

    const promises = bots.map(b => Roblox.getUsernameFromId(b.robloxId));
    promises.map(p => p.catch(console.error));
    const usernames = await Promise.all(promises);

    return bots.map((bot, i) => ({
      ...bot,
      username: usernames[i]
    }));
  }

  @Post()
  @ResponseSchema(BotDTO)
  @Authorized(PermissionLevel.admin)
  async addBot (@Body() { robloxId, cookie }: AddBotBody): Promise<BotDTO> {
    const existing = await database.bots.findOne({ robloxId });
    if (existing) throw new BadRequestError(`Bot with ID ${robloxId} already exists`);

    const username = await Roblox.getUsernameFromId(robloxId);
    if (!username) throw new BadRequestError("Roblox ID invalid");

    const bot = new Bot();
    bot.robloxId = robloxId;
    bot.cookie = cookie;
    bot.cookieUpdated = new Date();

    await database.bots.save(bot);

    return {
      ...bot,
      username
    };
  }

  @Patch("/:id")
  @ResponseSchema(BotDTO)
  @Authorized(PermissionLevel.admin)
  async updateBot (@Param("id") id: string, @Body() { cookie, dead }: UpdateBotBody): Promise<BotDTO> {
    const bot = await database.bots.findOne(id);
    if (!bot) throw new NotFoundError();

    // Long `if`; update empty strings
    if (cookie !== undefined && cookie !== null) {
      bot.cookie = cookie ?? bot.cookie;
      bot.cookieUpdated = new Date();
    }

    // `??` instead of `||` as the latter only checks for a falsy value (e. g. empty string),
    // whereas `??` checks for only `null` or `undefined`
    bot.dead = dead ?? bot.dead;

    await database.bots.save(bot);

    const username = await Roblox.getUsernameFromId(bot.robloxId);

    return {
      ...bot,
      username
    };
  }

  @Get("/queue")
  @ResponseSchema(QueueItem, { isArray: true })
  @Authorized(PermissionLevel.admin)
  async queue (): Promise<QueueItem[]> {
    let groups = await database.groups.getInactiveBotGroups();
    groups = groups.filter(group => !!group.bot);

    // `!` - see filter above
    // Remove when https://github.com/microsoft/TypeScript/issues/16069 is a feature
    const usernamePromises = groups.map(g => Roblox.getUsernameFromId(g.bot!.robloxId));
    usernamePromises.map(p => p.catch(console.error));
    const usernamesProm = Promise.all(usernamePromises);

    const groupInfoPromises = groups.map(g => Roblox.getGroup(g.robloxId));
    groupInfoPromises.map(p => p.catch(console.error));
    const groupInfosProm = Promise.all(groupInfoPromises);

    const [usernames, groupInfos] = await Promise.all([usernamesProm, groupInfosProm]);

    return groups.map((group, i) => {
      const { bot } = group;

      return {
        group: {
          ...group,
          robloxInfo: groupInfos[i],
          bot: undefined
        },
        bot: {
          ...bot!,
          username: usernames[i]
        }
      };
    });
  }
}
