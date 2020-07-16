import {
  CommandGeneratorFunction, EmbedField, EmbedOptions, Role
} from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { AQUARIUS_VERIFY_URL } from "../../constants";

export default class GetRolesCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("getroles", {
      aliases: ["role", "roles"],
      caseInsensitive: true,
      cooldown: 1000 * 60 * 2,
      description: "Receive verified roles and rank roles",
      guildOnly: true
    }, client);
  }

  public run: CommandGeneratorFunction = async msg => {
    // `guildOnly` option should prevent this
    if (!msg.member) throw new Error("This command can only be ran in guilds");

    await msg.channel.sendTyping();

    const {
      verified, added, removed, unusualConfig
    } = await msg.member.setGroupRoles();

    const mapRole = (role: Role) => role.name;

    const embedFields: EmbedField[] = [];

    if (added.length > 0) {
      embedFields.push({
        name: "Added roles",
        value: added.map(mapRole).join("\n"),
        inline: true
      });
    }

    if (removed.length > 0) {
      embedFields.push({
        name: "Removed roles",
        value: removed.map(mapRole).join("\n"),
        inline: true
      });
    }

    const embedFn = verified ? this.client.generateEmbed : this.client.generateWarningEmbed;

    const options: EmbedOptions = { fields: embedFields };

    if (!verified) {
      options.description = `You are not verified, go to ${AQUARIUS_VERIFY_URL} to link your Roblox account.`;
      options.url = AQUARIUS_VERIFY_URL;
    } else if (embedFields.length > 0) {
      options.description = "Your account is linked and your roles are now being set. See below for a list of added and removed roles.";
      if (unusualConfig) options.description += "\n\n***Warning:** An unusual configuration was detected in this group's rank binds. A situation in which one or more roles were to be added **and** removed occurred. The role(s) were added.*";
    } else {
      options.description = "Your account is linked but your roles are already set correctly! :)";
    }

    const embed = embedFn.call(this.client, options);

    return { embed };
  }
}
