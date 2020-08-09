import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from "../..";
import CetusClient from "../../../CetusClient";
import { getPermissions, postShout } from "../../../api";
import { getLink } from "../../../api/aquarius";
import Roblox from "../../../api/roblox/Roblox";

export default class ShoutCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("shout", {
      aliases: ["announce", "groupshout"],
      caseInsensitive: true,
      cooldown: 1000 * 60 * 2,
      description: "Send shout to linked Roblox group",
      guildOnly: true
    }, client);
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    let message = args.join(" ");
    if (args.length <= 0 || !message || message.trim().length <= 0) {
      return { embed: this.client.generateErrorEmbed({ description: "This command requires one argument; a shout message" }) };
    }

    const reply = await msg.channel.createMessage("Checking account link and permissions..");
    await msg.channel.sendTyping();

    const link = await getLink(msg.author.id);
    if (!link) return { embed: this.client.generateNotVerifiedEmbed() };

    const permissions = await getPermissions(msg.member.guild.id, link.robloxId);
    if (!permissions.postShout) {
      return { embed: this.client.generateErrorEmbed({ description: `You do not have permission to post shouts (your rank: \`${permissions.name}\`).` }) };
    }

    await reply.edit("Posting shout..");

    // Append username to shout if length allows it
    if (message.length <= 255) {
      const username = await Roblox.getUsernameFromId(link.robloxId);
      const append = ` ~ ${username}`;

      if (username && message.length + append.length <= 255) message += append;
    }

    try {
      const { message: actualMessage } = await postShout(msg.member.guild.id, { message });
      reply.delete();
      return {
        embed: this.client.generateEmbed({
          title: "Posted shout",
          description: "Successfully posted shout in group",
          fields: [
            {
              name: "Message",
              value: actualMessage
            }
          ]
        })
      };
    } catch (e) {
      reply.delete();
      return { embed: this.client.generateErrorEmbed({ description: "An error occurred while posting shout. Does the bot have permission to shout in the group? " }) };
    }
  }
}
