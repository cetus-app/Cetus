import { CommandGeneratorFunction, Guild, MessageContent } from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { CONFIG_MAPPINGS, ConfigMappings } from "../../constants";

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

  private async getConfig (friendlyKey: string, guild: Guild): Promise<MessageContent> {
    // Casting because we validate that it exists
    const { key, type } = CONFIG_MAPPINGS[friendlyKey as keyof ConfigMappings] || {};

    if (!key) {
      return {
        embed: this.client.generateErrorEmbed({
          title: "Invalid key",
          description: `Could not get value for setting \`${friendlyKey}\``
        })
      };
    }

    const id = await guild.getConfig(key);
    const value = id ? guild.getConfigValue(type, "id", id) : undefined;

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

  private async setConfig (friendlyKey: string, value: string, guild: Guild): Promise<MessageContent> {
    // Casting because we validate that it exists
    const { key, type } = CONFIG_MAPPINGS[friendlyKey as keyof ConfigMappings] || {};

    if (!key) {
      return {
        embed: this.client.generateErrorEmbed({
          title: "Invalid key",
          description: `\`${friendlyKey}\` is not a valid key`
        })
      };
    }

    const actualValue = guild.getConfigValue(type, "name", value);

    if (!actualValue) {
      return {
        embed: this.client.generateErrorEmbed({
          title: "Invalid value",
          description: `Could not find a ${type.name} with name \`${value}\``
        })
      };
    }

    await guild.setConfig(key, actualValue.id);

    return {
      embed: this.client.generateEmbed({
        title: "Value updated",
        description: `Value for \`${friendlyKey}\` was updated to \`${actualValue.name}\``
      })
    };
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

    const operation = args[0].toLowerCase();

    // GET VALUE
    if (operation === "get") {
      if (args.length < 2) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires one argument; a configuration key (see `config` command)"
          })
        };
      }

      const [, friendlyKey] = args;
      return this.getConfig(friendlyKey, msg.member.guild);
    }

    // SET VALUE
    if (operation === "set") {
      if (args.length < 3) {
        return {
          embed: this.client.generateErrorEmbed({
            title: "Invalid arguments",
            description: "This operation requires two arguments; a configuration key (see `config` command) and a new value"
          })
        };
      }

      const [, friendlyKey] = args;
      // Take values with spaces into account (use rest of array)
      const value = args.slice(2, args.length).join(" ");
      return this.setConfig(friendlyKey, value, msg.member.guild);
    }

    return {
      embed: this.client.generateErrorEmbed({
        title: "Invalid operation",
        description: "An invalid operation or an incorrect amount of arguments were supplied. Valid operations are listed below",
        fields: [
          {
            name: "Valid operations",
            value: ["get", "set"].join("\n")
          }
        ]
      })
    };
  }
}
