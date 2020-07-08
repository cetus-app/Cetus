import {
  CommandGeneratorFunction, EmbedField, EmbedOptions, Role
} from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { getIntegration, getRank } from "../../api";
import { getLink } from "../../api/aquarius";
import { AQUARIUS_URL } from "../../constants";

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
    await msg.channel.sendTyping();

    const addRoles: Role[] = [];

    const removeRoles: Role[] = [];

    let unusualConfig: boolean = false;

    // "Helper" functions
    const hasEntry = (add: boolean, role: Role): boolean => {
      const roles = add ? addRoles : removeRoles;

      return !!roles.find(r => r.id === role.id);
    };

    const addRole = (role: Role): void => {
      if (hasEntry(true, role)) return;

      // Do not remove role if it somehow ends up in both arrays
      if (hasEntry(false, role)) {
        unusualConfig = true;
        const i = removeRoles.findIndex(r => r.id === role.id);
        removeRoles.splice(i, 1);
      }

      addRoles.push(role);
    };

    const removeRole = (role: Role): void => {
      if (hasEntry(false, role)) return;

      removeRoles.push(role);
    };

    const mapRoles = (): { added: string[], removed: string[] } => {
      const added = addRoles.map(r => r.name);
      const removed = removeRoles.map(r => r.name);

      return {
        added,
        removed
      };
    };

    const { guildID, member } = msg;

    const link = await getLink(member!.id);

    // Command is guild only
    const { config: { binds, unverifiedRoleId, verifiedRoleId } } = await getIntegration(guildID!);

    if (unverifiedRoleId) {
      const role = member!.guild.roles.get(unverifiedRoleId);

      // TODO: Handle invalid role ID
      // if (!role) {}

      if (role) {
        if (link && member!.roles.includes(role.id)) removeRole(role);

        if (!link && !member!.roles.includes(role.id)) addRole(role);
      }
    }

    if (verifiedRoleId) {
      const role = member!.guild.roles.get(verifiedRoleId);

      // TODO: Handle invalid role ID
      // if (!role) {}

      if (role) {
        if (link && !member!.roles.includes(role.id)) addRole(role);

        if (!link && member!.roles.includes(role.id)) removeRole(role);
      }
    }

    if (link) {
      const { rank, role: groupRole } = await getRank(guildID!, link.robloxId);

      if (rank > 0) {
        if (binds.length > 0) {
          for (const bind of binds) {
            const role = member!.guild.roles.get(bind.roleId);

            if (!role) {
              // TODO: Handle invalid role ID
            } else {
              const eligible = bind.exclusive ? rank === bind.rank : rank >= bind.rank;

              if (eligible && !member!.roles.includes(role.id)) addRole(role);

              if (!eligible && member!.roles.includes(role.id)) removeRole(role);
            }
          }
        }

        const namedRole = member!.guild.roles.find(r => r.name.toLowerCase() === groupRole.toLowerCase());
        if (namedRole && !member!.roles.includes(namedRole.id)) addRole(namedRole);
      }
    }

    addRoles.forEach(r => member!.addRole(r.id));
    removeRoles.forEach(r => member!.removeRole(r.id));

    const embedFields: EmbedField[] = [];

    const { added, removed } = mapRoles();

    if (added.length > 0) {
      embedFields.push({
        name: "Added roles",
        value: added.join("\n"),
        inline: true
      });
    }

    if (removed.length > 0) {
      embedFields.push({
        name: "Removed roles",
        value: removed.join("\n"),
        inline: true
      });
    }

    const embedFn = link ? this.client.generateEmbed : this.client.generateWarningEmbed;

    const options: EmbedOptions = { fields: embedFields };

    if (!link) {
      options.description = `You are not verified, go to ${AQUARIUS_URL}/discord to link your Roblox account.`;
      options.url = `${AQUARIUS_URL}/discord`;
    } else if (embedFields.length > 0) {
      options.description = "Your account is linked and your roles are now being set. See below for a list of added and removed roles.";
      if (!unusualConfig) options.description += "\n\n***Warning:** An unusual configuration was detected in this group's rank binds. A situation in which one or more roles were to be added **and** removed occurred. The role(s) were added.*";
    } else {
      options.description = "Your account is linked but your roles are already set correctly! :)";
    }

    const embed = embedFn.call(this.client, options);

    return { embed };
  }
}
