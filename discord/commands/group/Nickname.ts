import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { AQUARIUS_VERIFY_URL } from "../../constants";

export default class NicknameCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("nickname", {
      aliases: ["nick", "name"],
      caseInsensitive: true,
      cooldown: 1000 * 60 * 2,
      description: "Receive configured nickname",
      guildOnly: true
    }, client);
  }

  public run: CommandGeneratorFunction = async msg => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    await msg.channel.sendTyping();

    const nick = await msg.member.computeGroupNickname();

    if (!nick) {
      return {
        embed: this.client.generateErrorEmbed({
          title: "Not verified",
          description: `You are not verified, go to ${AQUARIUS_VERIFY_URL} to link your Roblox account.`,
          url: AQUARIUS_VERIFY_URL
        })
      };
    }

    if (nick === msg.member.nick) {
      return { embed: this.client.generateEmbed({ description: "Your nickname is already set correctly! :)" }) };
    }

    const oldNick = msg.member.nick || msg.member.username;
    await msg.member.edit({ nick });
    return {
      embed: this.client.generateEmbed({
        title: "Nickname set",
        description: "Your nickname was updated!",
        fields: [
          {
            name: "Old nickname",
            value: oldNick,
            inline: true
          }, {
            name: "New nickname",
            value: nick,
            inline: true
          }
        ]
      })
    };
  }
}
