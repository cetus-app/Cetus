import {
  CurrentUser, ForbiddenError, Get, JsonController
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import database from "../../database";
import { User } from "../../entities";
import { PermissionLevel } from "../../entities/User.entity";
import { QueueItem } from "./types";

@JsonController("/bots")
export default class Bots {
  @Get("/queue")
  @ResponseSchema(QueueItem, { isArray: true })
  async queue (@CurrentUser({ required: true }) { permissionLevel }: User): Promise<QueueItem[]> {
    if (permissionLevel !== PermissionLevel.admin) throw new ForbiddenError();

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
