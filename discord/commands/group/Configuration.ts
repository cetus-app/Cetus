import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { CONFIG_MAPPINGS } from "../../constants";

export default class ConfigurationCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("configuration", {
      aliases: ["config", "settings"],
      caseInsensitive: true,
      cooldown: 1000 * 2,
      description: "Change configuration for group",
      guildOnly: true,
      requirements: { permissions: { administrator: true } }
    }, client);
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    await msg.channel.sendTyping();

    // LIST KEYS
    if (args.length === 0) {
      const friendlySettings = Object.entries(CONFIG_MAPPINGS).map(([key, { type }]) => `${key}: ${type.name}`);

      return {
        embed: this.client.generateEmbed({
          title: "Configuration",
          description: "This command can be used to change settings for the server. See below for available settings and their types. Use the `help` command for more information on usage.",
          fields: [
            {
              name: "Available settings",
              value: friendlySettings.join("\n")
            }
          ]
        })
      };
    }

    // GET VALUE
    if (args[0].toLowerCase() === "get") {
      if (args.length < 2) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires one argument; a configuration key (see `config` command)"
          })
        };
      }

      const [, friendlyKey] = args;

      const { key, type } = CONFIG_MAPPINGS[friendlyKey] || {};

      if (!key) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid key",
            description: `Could not get value for setting \`${friendlyKey}\``
          })
        };
      }

      const id = await msg.member.guild.getConfig(key);
      const value = id ? msg.member.guild.getConfigValue(type, "id", id) : undefined;

      return {
        embed: this.client.generateEmbed({
          title: `Value for setting \`${friendlyKey}\``,
          description: !value ? `This setting is not set. Use \`config set ${friendlyKey} {value}\` to set it.` : undefined,
          fields: value && [
            {
              name: "Key",
              value: friendlyKey,
              inline: true
            },
            {
              name: "Type",
              value: type.name,
              inline: true
            },
            {
              name: "Value",
              value: value.name,
              inline: true
            }
          ]
        })
      };
    }

    // SET VALUE
    if (args[0].toLowerCase() === "set") {
      if (args.length < 3) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires two arguments; a configuration key (see `config` command) and a new value"
          })
        };
      }

      // Take into account values with spaces (use rest of array)
      const value = args.slice(2, args.length).join(" ");

      const [, friendlyKey] = args;

      const { key, type } = CONFIG_MAPPINGS[friendlyKey] || {};

      if (!key) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid key",
            description: `\`${friendlyKey}\` is not a valid key`
          })
        };
      }

      const actualValue = msg.member.guild.getConfigValue(type, "name", value);

      if (!actualValue) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid value",
            description: `Could not find a ${type.name} with name \`${value}\``
          })
        };
      }

      await msg.member.guild.setConfig(key, actualValue.id);

      return {
        embed: this.client.generateEmbed({
          title: "Value updated",
          description: `Value for \`${friendlyKey}\` was updated to \`${actualValue.name}\``
        })
      };
    }

    return {
      embed: this.client.generateErrorEmbed({
        title: "Invalid operation",
        description: "An invalid operation or an incorrect amount of arguments were supplied. Valid operations are listed below"
      })
    };
  }
}
