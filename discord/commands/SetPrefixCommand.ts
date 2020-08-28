import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from ".";
import CetusClient from "../CetusClient";

export default class SetPrefixCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("setprefix", {
      aliases: ["prefix", "set-prefix"],
      caseInsensitive: true,
      cooldown: 1000,
      description: "Change guild prefix",
      guildOnly: true,
      requirements: { permissions: { administrator: true } }
    }, client);
  }

  public run: CommandGeneratorFunction = async (msg, args) => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    await msg.channel.sendTyping();

    const prefix = args.join(" ");
    if (args.length <= 0 || !prefix || prefix.trim().length <= 0) {
      return { embed: this.client.generateErrorEmbed({ description: "This command requires one argument; a command prefix" }) };
    }

    await msg.member.guild.setConfig("prefix", prefix);
    this.client.registerGuildPrefix(msg.member.guild.id, prefix);

    return {
      embed: this.client.generateEmbed({
        title: "Command prefix changed",
        description: "The command prefix for this guild was successfully updated",
        fields: [
          {
            name: "New prefix",
            value: `\`${prefix}\``
          }
        ]
      })
    };
  }
}
