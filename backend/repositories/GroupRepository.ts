import { EntityRepository, Repository } from "typeorm";

import Group from "../entities/Group.entity";


@EntityRepository(Group)
export default class GroupRepository extends Repository<Group> {
  getGroup (groupId: string) {
    return this.findOne({ id: groupId });
  }

  getFullGroup (groupId: string) {
    return this.findOne({ id: groupId }, { relations: ["owner", "integrations", "keys", "bot"] });
  }

  getGroupByRoblox (robloxGroupId: number) {
    return this.findOne({ robloxId: robloxGroupId }, { relations: ["owner"] });
  }
}
