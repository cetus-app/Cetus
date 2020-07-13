import { Member, Role } from "eris";

import { getRank } from "../../../api";
import { getLink } from "../../../api/aquarius";

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

  const { binds, unverifiedRoleId, verifiedRoleId } = await this.guild.getConfigs();
  const link = await getLink(this.id);

  if (unverifiedRoleId) {
    const role = this.guild.roles.get(unverifiedRoleId);

    // TODO: Handle invalid role ID
    // if (!role) {}

    if (role) {
      if (link && this.roles.includes(role.id)) removeRole(role);

      if (!link && !this.roles.includes(role.id)) addRole(role);
    }
  }

  if (verifiedRoleId) {
    const role = this.guild.roles.get(verifiedRoleId);

    // TODO: Handle invalid role ID
    // if (!role) {}

    if (role) {
      if (link && !this.roles.includes(role.id)) addRole(role);

      if (!link && this.roles.includes(role.id)) removeRole(role);
    }
  }

  if (link) {
    const { rank, role: groupRole } = await getRank(this.guild.id, link.robloxId);

    if (rank > 0) {
      if (binds.length > 0) {
        for (const bind of binds) {
          const role = this.guild.roles.get(bind.roleId);

          if (!role) {
            // TODO: Handle invalid role ID
          } else {
            const eligible = bind.exclusive ? rank === bind.rank : rank >= bind.rank;

            if (eligible && !this.roles.includes(role.id)) addRole(role);

            if (!eligible && this.roles.includes(role.id)) removeRole(role);
          }
        }
      }

      const namedRole = this.guild.roles.find(r => r.name.toLowerCase() === groupRole.toLowerCase());
      if (namedRole && !this.roles.includes(namedRole.id)) addRole(namedRole);
    }
  }

  return {
    verified: !!link,
    add: addRoles,
    remove: removeRoles,
    unusualConfig
  };
};
