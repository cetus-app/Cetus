import {
  CommandGeneratorFunction, Guild, MessageContent, Role
} from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import InvalidCommandArgument from "../InvalidCommandArgument";

export default class BindsCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("binds", {
      aliases: ["setbinds", "rankroles"],
      caseInsensitive: true,
      cooldown: 1000 * 2,
      description: "List/change binds for group",
      guildOnly: true,
      requirements: { permissions: { administrator: true } }
    }, client);
  }

  private invalidOperationMessage (): MessageContent {
    return {
      embed: this.client.generateErrorEmbed({
        title: "Invalid operation",
        description: "An invalid operation or an incorrect amount of arguments were supplied. Valid operations are listed below",
        fields: [
          {
            name: "Valid operations",
            value: ["list", "add", "del"].join("\n")
          }
        ]
      })
    };
  }

  private invalidArgMessage (message: string): MessageContent {
    return {
      embed: this.client.generateErrorEmbed({
        title: "Invalid argument",
        description: message
      })
    };
  }

  private async handleArgs (
    guild: Guild,
    rankStr: string,
    roleSearch: string,
    exclusiveStr: string = "no",
    groupId?: string
  ): Promise<[number, Role, boolean, number?]> {
    const rank = parseInt(rankStr, 10);

    if (Number.isNaN(rank) || rank <= 0 || rank >= 255) {
      throw new InvalidCommandArgument("rank", rank, "Rank must not be smaller than 1 or greater than 254");
    }

    const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;
    if (Number.isNaN(parsedGroupId)) {
      throw new InvalidCommandArgument("groupId", groupId, "Group ID must be a number");
    }

    const role = guild.getConfigValue(Role, "name", roleSearch) || guild.getConfigValue(Role, "mention", roleSearch);
    if (!role) {
      const message = roleSearch.startsWith("<") ? `${roleSearch} is not a role` : `Could not find role with name \`${roleSearch}\``;
      throw new InvalidCommandArgument("role", roleSearch, message);
    }

    if (exclusiveStr.toLowerCase() !== "yes" && exclusiveStr.toLowerCase() !== "no") {
      throw new InvalidCommandArgument("exclusive", exclusiveStr, "Exclusive must be either `yes` or `no`");
    }

    const exclusive = exclusiveStr.toLowerCase() === "yes";

    const binds = await guild.getConfig("binds");
    const existing = binds.find(b => b.rank === rank && b.roleId === role.id && b.exclusive === exclusive);
    if (existing) {
      throw new InvalidCommandArgument("bind", existing, "An identical bind already exists.");
    }

    return [rank, role, exclusive, parsedGroupId];
  }

  private async listBinds (guild: Guild): Promise<MessageContent> {
    const binds = await guild.getConfig("binds");

    // To keep indexes in order and valid for deletion
    // (for example 2 binds; first one deleted -> only second shows, but with number 2 -> cannot delete 2 because it now has number 1)
    let invalidCount = 0;

    const friendlyBinds: string[] = binds.reduce<string[]>((accumulator, {
      rank, roleId, exclusive, groupId
    }, index) => {
      const role = guild.roles.get(roleId);

      if (role) {
        // Every bind *after* invalid has number reduced by `invalidCount` (see above)
        accumulator.push(`
          **${(index + 1 - invalidCount).toString()}**. Rank: ${rank.toString()}
          Role: ${role.name}
          Exclusive: ${exclusive ? "Yes" : "No"}
          Group ID: ${groupId?.toString() || "Not set (will use linked group)"}
        `);
      } else {
        invalidCount++;
        guild.handleInvalidBindRole({
          rank,
          roleId,
          exclusive
        });
      }

      return accumulator;
    }, []);

    return {
      embed: this.client.generateEmbed({
        title: "Group binds",
        description: "See below for a list of group binds set in this server. Use `binds del {number}` to delete a bind.",
        fields: [
          {
            name: "Binds",
            value: friendlyBinds.length > 0 ? friendlyBinds.join("") : "No binds are set. Use `binds add` to create some!"
          }
        ]
      })
    };
  }

  private async addBind (guild: Guild, rank: number, role: Role, exclusive: boolean, groupId?: number): Promise<MessageContent> {
    const config = await guild.getConfigs();

    const binds = config.binds.slice();
    binds.push({
      rank,
      roleId: role.id,
      exclusive,
      groupId
    });

    await guild.setConfigs({
      ...config,
      binds
    });

    return {
      embed: this.client.generateEmbed({
        title: "Bind added",
        description: "Successfully added new rank bind",
        fields: [
          {
            name: "Rank",
            value: rank.toString(),
            inline: true
          },
          {
            name: "Role",
            value: role.name,
            inline: true
          },
          {
            name: "Exclusive",
            value: exclusive ? "Yes" : "No",
            inline: true
          },
          {
            name: "Group ID",
            value: groupId?.toString() || "Not set (will use linked group)",
            inline: true
          }
        ]
      })
    };
  }

  private async delBind (guild: Guild, num: number): Promise<MessageContent> {
    const config = await guild.getConfigs();

    const index = num - 1;
    const bind = config.binds[index];

    if (!bind) {
      return this.invalidArgMessage(`${num} is not a valid bind (did you make sure to use the *list number* and not the rank number?)`);
    }

    const binds = config.binds.slice();
    binds.splice(index, 1);

    await guild.setConfigs({
      ...config,
      binds
    });

    const role = guild.roles.get(bind.roleId);

    return {
      embed: this.client.generateEmbed({
        title: "Bind deleted",
        description: "Successfully deleted bind (see below for information about the deleted bind)",
        fields: [
          {
            name: "List number",
            value: num.toString(),
            inline: true
          },
          {
            name: "Rank",
            value: bind.rank.toString(),
            inline: true
          },
          {
            name: "Role",
            value: role?.name || bind.roleId,
            inline: true
          },
          {
            name: "Exclusive",
            value: bind.exclusive ? "Yes" : "No",
            inline: true
          },
          {
            name: "Group ID",
            value: bind.groupId?.toString() || "Not set",
            inline: true
          }
        ]
      })
    };
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    await msg.channel.sendTyping();

    if (args.length === 0) {
      return this.invalidOperationMessage();
    }

    const operation = args[0].toLowerCase();

    // LIST BINDS
    if (operation === "list") {
      return this.listBinds(msg.member.guild);
    }

    // ADD BIND
    if (operation === "add") {
      if (args.length < 3) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires two arguments; a rank number (1-254) and a role name. You can also (optionally) set `exclusive` (third argument) to `yes` or `no` and `groupId` (fourth argument) to a Roblox group ID"
          })
        };
      }

      // Length checked and values are always strings
      // Rank number, role name, exclusive and group ID
      const typedArgs = args.slice(1, 5) as [string, string, string?, string?];

      try {
        const validArgs = await this.handleArgs(msg.member.guild, ...typedArgs);

        return this.addBind(msg.member.guild, ...validArgs);
      } catch (e) {
        if (e instanceof InvalidCommandArgument) {
          return this.invalidArgMessage(e.message);
        }

        throw e;
      }
    }

    // DELETE BIND
    if (operation === "del") {
      if (args.length < 2) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires one argument; a bind *list number* (from `binds list`)"
          })
        };
      }

      const num = parseInt(args[1], 10);

      if (Number.isNaN(num)) {
        return this.invalidArgMessage(`${args[1]} is not a valid number`);
      }

      return this.delBind(msg.member.guild, num);
    }

    return this.invalidOperationMessage();
  }
}
