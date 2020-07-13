import { Guild, GuildChannel, Role } from "eris";

import { getIntegration, updateIntegration } from "../../../api";
import { searchCollection } from "../../../shared/util";

Guild.prototype.getConfigs = async function getConfigs () {
  const integration = await getIntegration(this.id);

  return integration.config;
};

Guild.prototype.getConfig = async function getConfig (key) {
  const config = await this.getConfigs();
  return config[key];
};

Guild.prototype.setConfigs = async function setConfigs (newConfig) {
  await updateIntegration(this.id, newConfig);
};

Guild.prototype.setConfig = async function setConfig (key, value) {
  const newConfig = { [key]: value };
  return this.setConfigs(newConfig);
};

Guild.prototype.getConfigValue = function getConfigValue (type, key, compare) {
  let value;

  switch (type) {
    case Role:
      value = searchCollection(this.roles, key as keyof Role, compare);
      break;

    case GuildChannel:
      value = searchCollection(this.channels, key as keyof GuildChannel, compare);
      break;

    default:
  }

  return value as any;
};
