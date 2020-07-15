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
    exclusiveStr: string = "no"
  ): Promise<[number, Role, boolean]> {
    const rank = parseInt(rankStr, 10);

    if (Number.isNaN(rank) || rank <= 0 || rank >= 255) {
      throw new InvalidCommandArgument("rank", rank, "Rank must not be smaller than 1 or greater than 254");
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

    return [rank, role, exclusive];
  }

  private async listBinds (guild: Guild): Promise<MessageContent> {
    const binds = await guild.getConfig("binds");

    const friendlyBinds: string[] = binds.reduce<string[]>((accumulator, { rank, roleId, exclusive }, index) => {
      const role = guild.roles.get(roleId);

      // Handle invalid role ID
      // if (!role) {}

      if (role) {
        accumulator.push(`
          **${(index + 1).toString()}**. Rank: ${rank.toString()}
          Role: ${role.name}
          Exclusive: ${exclusive ? "Yes" : "No"}
        `);
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
            value: friendlyBinds.join("")
          }
        ]
      })
    };
  }

  private async addBind (guild: Guild, rank: number, role: Role, exclusive: boolean): Promise<MessageContent> {
    const config = await guild.getConfigs();

    const binds = config.binds.slice();
    binds.push({
      rank,
      roleId: role.id,
      exclusive
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
            description: "This operation requires two arguments; a rank number (1-254) and a role name. You can also set `exclusive` (third argument) to `yes` or `no` (optional)"
          })
        };
      }

      // Length checked and values are always strings
      const typedArgs = args.slice(1, 4) as [string, string, string?];

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
