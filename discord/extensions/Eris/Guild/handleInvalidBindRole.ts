import { Guild } from "eris";

Guild.prototype.handleInvalidBindRole = async function handleInvalidBindRole ({ rank, roleId, exclusive }) {
  const config = await this.getConfigs();
  const binds = config.binds.slice();

  const index = binds.findIndex(b => b.rank === rank && b.roleId === roleId && b.exclusive === exclusive);
  if (index >= 0) {
    binds.splice(index, 1);
    await this.setConfigs({
      ...config,
      binds
    });

    // Indentation removed because JS includes it in the string (it is visible in the message)
    await this.sendMemberMessage(this.ownerID, `Cetus detected an invalid binds configuration in ${this.name}.
The following bind has an invalid/nonexistent role set:
Rank: ${rank}
Role ID (invalid): ${roleId}
Exclusive: ${exclusive ? "Yes" : "No"}.
This can happen when a role is deleted after the bind is set.
The bind was deleted, you may create a new one with a valid role.`);
  }
};
