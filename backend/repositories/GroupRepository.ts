import { EntityRepository, Repository } from "typeorm";

import { FullGroup, PartialGroup } from "../controllers/GroupController/types";
import { integrationMeta, PartialIntegration } from "../controllers/IntegrationController/types";
import Group from "../entities/Group.entity";


@EntityRepository(Group)
export default class GroupRepository extends Repository<Group> {
  getGroup (groupId: string) {
    return this.findOne({ id: groupId });
  }

  async getFullGroup (groupId: string): Promise<FullGroup|undefined> {
    const group: FullGroup|undefined = await this.findOne({ id: groupId }, { relations: ["owner", "integrations", "keys", "bot"] });
    if (!group || !group.integrations) return group;
    return group;
  }

  getGroupWithCookie (groupId: string): Promise<Group | undefined> {
    return this.createQueryBuilder("group")
      .leftJoinAndSelect("group.bot", "bot")
      .addSelect("bot.cookie")
      .where("group.id = :groupId", { groupId })
      .getOne();
  }

  getGroupByRoblox (robloxGroupId: number): Promise<PartialGroup|undefined> {
    return this.findOne({ robloxId: robloxGroupId }, { relations: ["owner"] });
  }

  getInactiveBotGroups (): Promise<Group[]> {
    return this.find({
      where: { botActive: false },
      relations: ["bot"]
    });
  }

  // Used to check for existing links
  getGroupsByRoblox (robloxIds: number[]) {
    // Turns an array of ids into an array of objects for TypeORM
    const query = robloxIds.map(id => ({ robloxId: id }));
    return this.find({
      where: query,
      select: ["robloxId", "id"]
    });
  }
}
