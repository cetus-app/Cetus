import { EntityRepository, getCustomRepository, Repository } from "typeorm";

import Group from "../entities/Group.entity";


@EntityRepository(Group)
class GroupRepository extends Repository<Group> {
  getGroup(groupId) {
    return this.findOne({ id: groupId }, {
      relations: ["owner"]
    });
  }

}
export default getCustomRepository(GroupRepository);
