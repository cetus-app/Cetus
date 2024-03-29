import { Member, Role } from "eris";

import { getRank } from "../../../api";
import { AquariusLink, getLink } from "../../../api/aquarius";
import Roblox from "../../../api/roblox/Roblox";
import { DiscordBotConfig } from "../../../api/types";

Member.prototype.computeGroupRoles = async function computeGroupRoles () {
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

    // Add role (rather than remove) if it somehow ends up in both arrays
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

  const handleBind = async (bind: DiscordBotConfig["binds"][number], link: AquariusLink, linkedRank: number): Promise<void> => {
    const role = this.guild.roles.get(bind.roleId);

    if (role) {
      let rank: number;

      if (!bind.groupId) rank = linkedRank;
      else {
        const userGroup = await Roblox.getUserGroup(link.robloxId, bind.groupId);
        if (!userGroup || userGroup.rank < 1) return;

        rank = userGroup.rank;
      }

      const eligible = bind.exclusive ? rank === bind.rank : rank >= bind.rank;

      if (eligible && !this.roles.includes(role.id)) addRole(role);

      if (!eligible && this.roles.includes(role.id)) removeRole(role);
    } else {
      this.guild.handleInvalidBindRole(bind);
    }
  };

  const { binds, unverifiedRoleId, verifiedRoleId } = await this.guild.getConfigs();
  const link = await getLink(this.id);

  if (unverifiedRoleId) {
    const role = this.guild.roles.get(unverifiedRoleId);

    if (role) {
      if (link && this.roles.includes(role.id)) removeRole(role);

      if (!link && !this.roles.includes(role.id)) addRole(role);
    } else {
      // `await` unnecessary; can happen while other things happen
      this.guild.handleInvalidConfig("unverifiedRoleId", "unverified", Role);
    }
  }

  if (verifiedRoleId) {
    const role = this.guild.roles.get(verifiedRoleId);

    if (role) {
      if (link && !this.roles.includes(role.id)) addRole(role);

      if (!link && this.roles.includes(role.id)) removeRole(role);
    } else {
      this.guild.handleInvalidConfig("verifiedRoleId", "verified", Role);
    }
  }

  if (link) {
    const { rank: linkedRank, role: linkedGroupRole } = await getRank(this.guild.id, link.robloxId);

    if (binds.length > 0) {
      const promises: Promise<void>[] = binds.map(b => handleBind(b, link, linkedRank));
      await Promise.all(promises);
    }

    const namedRole = this.guild.roles.find(r => r.name.toLowerCase() === linkedGroupRole.toLowerCase());
    if (namedRole && !this.roles.includes(namedRole.id)) addRole(namedRole);
  }

  return {
    verified: !!link,
    add: addRoles,
    remove: removeRoles,
    unusualConfig
  };
};
