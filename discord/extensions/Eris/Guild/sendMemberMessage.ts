import { Guild } from "eris";

Guild.prototype.sendMemberMessage = async function sendMemberMessage (id, ...messageArgs) {
  const member = await this.fetchMember(id);
  if (!member) throw new Error(`Member with ID ${id} not found`);

  const channel = await member.user.getDMChannel();
  return channel.createMessage(...messageArgs);
};
