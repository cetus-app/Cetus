import { EntityRepository, Repository } from "typeorm";

import Group from "../entities/Group.entity";
import User from "../entities/User.entity";

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  // if we want we can make user a User|String as typeorm will accept both the ID or the user.
  async getUserGroups (user: User, includeShared?: boolean): Promise<Group[]> {
    const relations: (keyof User)[] = ["groups"];
    if (includeShared) {
      relations.push("sharedGroups");
    }

    const u = await this.findOne({ id: user.id }, { relations });
    if (!u) return [];

    const groups = [...u.groups];
    if (includeShared) {
      return groups.concat(u.sharedGroups);
    }
    return groups;
  }

  // Get user from UserId
  // We could add in common relations, or make them eager
  getUser (userId: string) {
    return this.findOne({ id: userId });
  }

  getUserByRId (robloxId: number): Promise<User | undefined> {
    return this.findOne({ robloxId });
  }
}
