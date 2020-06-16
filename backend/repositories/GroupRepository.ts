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

  getGroupWithCookie (groupId: string): Promise<Group | undefined> {
    return this.createQueryBuilder("group")
      .leftJoinAndSelect("group.bot", "bot")
      .addSelect("bot.cookie")
      .where("group.id = :groupId", { groupId })
      .getOne();
  }

  getGroupByRoblox (robloxGroupId: number) {
    return this.findOne({ robloxId: robloxGroupId }, { relations: ["owner"] });
  }

  getInactiveBotGroups (): Promise<Group[]> {
    return this.find({
      where: { botActive: false },
      relations: ["bot"]
    });
  }
}
