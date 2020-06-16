import {
  CurrentUser, ForbiddenError, Get, JsonController
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

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

    const groups = await database.groups.getInactiveBotGroups();

    return groups.filter(group => !!group.bot).map(group => {
      const { bot } = group;

      return {
        group: {
          ...group,
          bot: undefined
        },
        // See filter above
        // Remove when https://github.com/microsoft/TypeScript/issues/16069 is a feature
        bot: bot!
      };
    });
  }
}
