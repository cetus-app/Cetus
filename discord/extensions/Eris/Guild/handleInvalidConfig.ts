import { Guild } from "eris";

Guild.prototype.handleInvalidConfig = async function handleInvalidConfig (key, friendlyKey, type) {
  if (key === "binds") {
    throw new RangeError("Cannot handle invalid binds, use `Guild.handleInvalidBindRole`");
  }

  await this.setConfig(key, undefined);

  // Indentation removed because JS includes it in the string (it is visible in the message)
  await this.sendMemberMessage(this.ownerID, `Cetus detected an invalid configuration in ${this.name}.
The setting \`${friendlyKey}\` was set to an invalid/nonexistent ${type.name}. \
This can happen when a role, channel or similar is deleted after it is set.
\`${friendlyKey}\` was unset, you may set it to a valid value again.`);
};
