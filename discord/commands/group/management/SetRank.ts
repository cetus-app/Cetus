import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from "../..";
import CetusClient from "../../../CetusClient";
import {
  ApiError, getPermissions, getRank, setRank
} from "../../../api";
import { getLink } from "../../../api/aquarius";
import Roblox from "../../../api/roblox/Roblox";

export default class SetRankCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("setrank", {
      aliases: ["set-rank", "changerank", "rank"],
      caseInsensitive: true,
      cooldown: 1000 * 30,
      description: "Change a user's rank in the linked group. Supply a Roblox username or a Discord mention/ping and new rank number. Will also update Discord roles from binds if mention is supplied.",
      guildOnly: true
    }, client);
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    if (args.length < 2) {
      return { embed: this.client.generateErrorEmbed({ description: "This command requires two arguments; a Roblox username or a Discord user mention and a rank number" }) };
    }

    const [target, rankStr] = args;

    const rank = parseInt(rankStr, 10);

    if (Number.isNaN(rank) || rank <= 0 || rank >= 255) {
      return { embed: this.client.generateErrorEmbed({ description: "Rank must not be smaller than 1 or greater than 254" }) };
    }

    const reply = await msg.channel.createMessage("Checking account link and permissions..");
    await msg.channel.sendTyping();

    const link = await getLink(msg.author.id);
    if (!link) {
      reply.delete();
      return { embed: this.client.generateNotVerifiedEmbed() };
    }

    const permissions = await getPermissions(msg.member.guild.id, link.robloxId);
    if (!permissions.changeRank || rank >= permissions.rank) {
      reply.delete();
      return { embed: this.client.generateErrorEmbed({ description: `You do not have permission to change ranks (your rank: \`${permissions.name}\`).` }) };
    }

    let targetRbxId: number;

    const mentionedUser = this.client.parseMention(target);
    if (mentionedUser) {
      const targetLink = await getLink(mentionedUser.id);
      if (!targetLink) {
        reply.delete();
        return { embed: this.client.generateErrorEmbed({ description: "That user has not linked their Discord account to Roblox. Please supply their Roblox username manually instead" }) };
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

    const targetMembership = await getRank(msg.member.guild.id, targetRbxId);
    if (targetMembership.rank >= permissions.rank) {
      reply.delete();
      return { embed: this.client.generateErrorEmbed({ description: `You do not have permission to change ranks (your rank: \`${permissions.name}\`).` }) };
    }

    await reply.edit("Attempting to change user's rank..");

    try {
      const { message } = await setRank(msg.member.guild.id, targetRbxId, rank);

      if (mentionedUser) {
        await reply.edit("Updating user's roles from binds..");
        const targetMember = await msg.member.guild.fetchMember(mentionedUser.id);
        if (targetMember) await targetMember.setGroupRoles();
      }

      reply.delete();

      return {
        embed: this.client.generateEmbed({
          title: "Changed rank",
          description: message,
          fields: [
            {
              name: "New rank",
              value: rank.toString()
            }
          ]
        })
      };
    } catch (e) {
      reply.delete();

      if (e instanceof ApiError) {
        const { message } = await e.response.json();

        // TODO: Add `error` codes on "public" API endpoints?
        if (message && typeof message === "string") {
          const lowerMsg = message.toLowerCase();

          if (lowerMsg.includes("not a member")) {
            return { embed: this.client.generateErrorEmbed({ description: "That user is not a member of the linked group." }) };
          }

          if (lowerMsg.includes("role with rank") && lowerMsg.includes("does not exist")) {
            return { embed: this.client.generateErrorEmbed({ description: "That rank does not exist in the linked group." }) };
          }
        }
      }

      return { embed: this.client.generateErrorEmbed({ description: "An error occurred while changing user's rank. Does the bot have permission to change ranks in the group?" }) };
    }
  }
}
