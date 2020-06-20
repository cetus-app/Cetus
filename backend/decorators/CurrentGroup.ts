import { createParamDecorator, ForbiddenError, UnauthorizedError } from "routing-controllers";

import database from "../database";
import { Group } from "../entities";
import { IntegrationType } from "../entities/Integration.entity";
import { Action } from "../types";

// eslint-disable-next-line @typescript-eslint/naming-convention
const CurrentGroup = (integrations: IntegrationType[] = []) => createParamDecorator({
  // Doesn't throw when `value` returns `undefined` for some reason (thus throwing errors manually)
  required: true,
  value: async ({ request: req }: Action): Promise<Group> => {
    const header = req.header("authorization");
    if (!header || !header.startsWith("Bearer")) throw new UnauthorizedError();

    const token = header.split(" ")[1];

    const qb = await database.keys.createQueryBuilder("key")
      .leftJoinAndSelect("key.group", "group")
      .where("key.token = :token", { token });

    if (integrations.length > 0) qb.leftJoinAndSelect("group.integrations", "integration", "integration.type IN (:...integrations)", { integrations });

    const key = await qb.getOne();

    if (!key) throw new UnauthorizedError();

    if (integrations.length > 0) {
      const grpIntTypes = key.group.integrations.map(int => int.type);
      // Missing one or more required integration
      if (integrations.some(type => !grpIntTypes.includes(type))) throw new ForbiddenError();
    }

    return key.group;
  }
});

export default CurrentGroup;
