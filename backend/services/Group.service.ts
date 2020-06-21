import { Request } from "express";
import { ForbiddenError, NotFoundError } from "routing-controllers";

import { FullGroup } from "../controllers/GroupController/types";
import database from "../database";
import { Group } from "../entities";
import User from "../entities/User.entity";


export default class GroupService {
  constructor (private request: Request) {
  }

  // Returns either the group or throws an error if the user does not have access
  async canAccessGroup (groupId: Group["id"], user?: User): Promise<FullGroup> {
    const usr = this.request.user || user;
    const grp = await database.groups.getFullGroup(groupId);
    if (!grp) {
      throw new NotFoundError("Group not found");
    }

    if (!usr) {
      throw new Error("Cannot validate access: No user.");
    }

    // Check permissions
    if (grp.owner.id === usr.id) {
      return grp;
    }
    throw new ForbiddenError("You do not have access to that group.");
  }
}
