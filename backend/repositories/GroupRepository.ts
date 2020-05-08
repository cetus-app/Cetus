import { EntityRepository, Repository } from "typeorm";

import Group from "../entities/Group.entity";


@EntityRepository(Group)
export default class GroupRepository extends Repository<Group> {
  getGroup (groupId: string) {
    return this.findOne({ id: groupId }, { relations: ["owner"] });
  }
}
