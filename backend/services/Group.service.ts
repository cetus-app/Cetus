import { Request } from "express";
import { type } from "os";
import { ForbiddenError, NotFoundError } from "routing-controllers";

import { FullGroup } from "../controllers/GroupController/types";
import database from "../database";
import { Group } from "../entities";
import User from "../entities/User.entity";


export default class GroupService {
  constructor (private request: Request) {
  }

  // Returns either the group or throws an error if the user does not have access
  // Can also have a group passed if we've already fetched it and want to check if they have access
  async canAccessGroup (group: Group["id"]|Group, user?: User): Promise<Group> {
    const usr = this.request.user || user;
    const grp = typeof group !== "string" ? group : await database.groups.getFullGroup(group);
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
