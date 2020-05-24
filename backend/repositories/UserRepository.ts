import { EntityRepository, Repository } from "typeorm";

import Group from "../entities/Group.entity";
import User from "../entities/User.entity";

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  // if we want we can make user a User|String as typeorm will accept both the ID or the user.
  getUserGroups (user: User): Promise<Group[]> {
    return this.createQueryBuilder()
      .relation(User, "groups")
      .of(user.id)
      .loadMany();
  }

  // Get user from UserId
  // We could add in common relations, or make them eager
  getUser (userId: string) {
    return this.findOne({ id: userId });
  }
}
