import {
  CommandGeneratorFunction, EmbedField, Member, Role
} from "eris";

import { CetusCommand } from "..";
import CetusClient from "../../CetusClient";
import { getIntegration } from "../../api";
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

  private addRole (member: Member, role: Role): Promise<{ added: boolean, role: Role }> {
    return member.addRole(role.id).then(() => ({
      added: true,
      role
    }));
  }

  private removeRole (member: Member, role: Role): Promise<{ added: boolean, role: Role }> {
    return member.removeRole(role.id).then(() => ({
      added: false,
      role
    }));
  }

  private mapRoles (data: { added: boolean, role: Role }[]): { added: string[], removed: string[] } {
    const added = data.filter(x => x.added).map(x => x.role.name);
    const removed = data.filter(x => !x.added).map(x => x.role.name);

    return {
      added,
      removed
    };
  }

  public run: CommandGeneratorFunction = async msg => {
    const { guildID, member } = msg;

    const embedFields: EmbedField[] = [];

    const link = await getLink(member!.id);

    // Command is guild only
    const { config: { unverifiedRoleId, verifiedRoleId } } = await getIntegration(guildID!);

    const promises: Promise<{ added: boolean, role: Role }>[] = [];

    if (unverifiedRoleId) {
      const role = member!.guild.roles.get(unverifiedRoleId);

      // TODO: Handle invalid role ID
      // if (!role) {}

      const roleFn = link ? this.removeRole : this.addRole;

      if (role) {
        const doAction = link ? member!.roles.includes(role.id) : !member!.roles.includes(role.id);

        if (doAction) promises.push(roleFn(member!, role));
      }
    }

    if (verifiedRoleId) {
      const role = member!.guild.roles.get(verifiedRoleId);

      // TODO: Handle invalid role ID
      // if (!role) {}

      const roleFn = link ? this.addRole : this.removeRole;

      if (role) {
        const doAction = link ? !member!.roles.includes(role.id) : member!.roles.includes(role.id);

        if (doAction) promises.push(roleFn(member!, role));
      }
    }

    const data = await Promise.all(promises);
    const { added, removed } = this.mapRoles(data);

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

    const embed = embedFn.call(this.client, {
      description: `You are not verified, go to ${AQUARIUS_URL}/discord to link your Roblox account`,
      url: `${AQUARIUS_URL}/discord`,
      fields: embedFields
    });

    return { embed };
  }
}
