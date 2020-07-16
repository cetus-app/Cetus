import { Guild } from "eris";

Guild.prototype.sendMemberMessage = async function sendMemberMessage (id, ...messageArgs) {
  const member = await this.fetchMember(id);
  const channel = await member.user.getDMChannel();
  return channel.createMessage(...messageArgs);
};
