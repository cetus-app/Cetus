import { Guild } from "eris";

Guild.prototype.fetchMember = async function fetchMember (id) {
  let member = this.members.get(id);

  if (!member) {
    [member] = await this.fetchMembers({ userIDs: [id] });
  }

  return member;
};
