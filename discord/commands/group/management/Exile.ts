import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from "../..";
import CetusClient from "../../../CetusClient";
import { ApiError, exileUser, getPermissions } from "../../../api";
import { getLink } from "../../../api/aquarius";
import Roblox from "../../../api/roblox/Roblox";

export default class ExileCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("exile", {
      aliases: ["groupkick"],
      caseInsensitive: true,
      cooldown: 1000 * 60,
      description: "Exile/kick a user from linked group. Supply a Roblox username or mention a Discord user to exile them. Can also kick Discord user if a mention/ping is supplied (disabled by default).",
      guildOnly: true
    }, client);
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    const [target, discordKick] = args;
    if (!target || target.trim().length <= 0) {
      return { embed: this.client.generateErrorEmbed({ description: "This command requires one argument; a Roblox username or a Discord user mention. You can also (optionally) set `discordKick` (second argument) to `yes` or `no` (will kick user from Discord if mention is supplied, defaults to `no`)" }) };
    }

    const reply = await msg.channel.createMessage("Checking account link and permissions..");
    await msg.channel.sendTyping();

    const link = await getLink(msg.author.id);
    if (!link) {
      reply.delete();
      return { embed: this.client.generateNotVerifiedEmbed() };
    }

    const permissions = await getPermissions(msg.member.guild.id, link.robloxId);
    if (!permissions.removeMembers) {
      reply.delete();
      return { embed: this.client.generateErrorEmbed({ description: `You do not have permission to exile users (your rank: \`${permissions.name}\`).` }) };
    }

    let targetRbxId: number;

    const mentionedUser = this.client.parseMention(target);
    if (mentionedUser) {
      const targetLink = await getLink(mentionedUser.id);
      if (!targetLink) {
        reply.delete();
        return { embed: this.client.generateErrorEmbed({ description: "That user has not linked their Discord account to Roblox and thus cannot be exiled. Please supply their Roblox username manually instead" }) };
      }

      targetRbxId = targetLink.robloxId;
    } else {
      const id = await Roblox.getIdFromUsername(target);
      if (!id) {
        reply.delete();
        return { embed: this.client.generateErrorEmbed({ description: `Roblox user with name \`${target}\` not found` }) };
      }

      targetRbxId = id;
    }

    await reply.edit("Attempting to exile user..");

    try {
      const { message } = await exileUser(msg.member.guild.id, targetRbxId);

      if (mentionedUser && discordKick === "yes") {
        await reply.edit("Kicking user from Discord guild..");
        const targetMember = await msg.member.guild.fetchMember(mentionedUser.id);
        if (targetMember) await targetMember.kick(`Exiled/kicked by ${msg.member.getName()}`);
      }

      reply.delete();

      return {
        embed: this.client.generateEmbed({
          title: "Exiled user",
          description: mentionedUser && discordKick === "yes" ? "Exiled user from linked group and kicked from Discord guild" : message
        })
      };
    } catch (e) {
      reply.delete();

      if (e instanceof ApiError) {
        const { message } = await e.response.json();

        // TODO: Add `error` codes on "public" API endpoints?
        if (message && typeof message === "string" && message.toLowerCase().includes("not a member")) {
          return { embed: this.client.generateErrorEmbed({ description: "That user is not a member of the linked group." }) };
        }
      }

      return { embed: this.client.generateErrorEmbed({ description: "An error occurred while exiling user. Does the bot have permission to remove users from the group?" }) };
    }
  }
}
