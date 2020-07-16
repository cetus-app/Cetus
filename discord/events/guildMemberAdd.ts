import { Guild, Member, TextChannel } from "eris";

import CetusClient from "../CetusClient";

const guildMemberAdd = async (client: CetusClient, guild: Guild, member: Member): Promise<void> => {
  const nickP = member.computeGroupNickname().then(nick => (nick ? member.edit({ nick }) : Promise.resolve()));
  const rolesP = member.setGroupRoles();

  const [, { verified }] = await Promise.all([nickP, rolesP]);

  if (guild.systemChannelID) {
    const channel = guild.channels.get(guild.systemChannelID);

    if (channel && channel instanceof TextChannel) {
      if (verified) {
        await channel.createMessage({
          content: member.mention,
          embed: client.generateEmbed({
            title: "Verified",
            description: "Your Discord account is linked to a Roblox account. Your nickname and roles have been set! :)"
          })
        });
      } else {
        await channel.createMessage({
          content: member.mention,
          embed: client.generateNotVerifiedEmbed()
        });
      }
    }
  }
};

export default guildMemberAdd;
