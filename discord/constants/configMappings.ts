import { GuildChannel, Role } from "eris";

import { DiscordBotConfig } from "../api/types";

export type ConfigDiscordType = typeof Role | typeof GuildChannel;

export interface ConfigMapping {
  key: Exclude<keyof DiscordBotConfig, "guildId" | "binds">;
  type: ConfigDiscordType;
}

export interface ConfigMappings {
  unverified: ConfigMapping;
  verified: ConfigMapping;
}

export const CONFIG_MAPPINGS: ConfigMappings = {
  unverified: {
    key: "unverifiedRoleId",
    type: Role
  },
  verified: {
    key: "verifiedRoleId",
    type: Role
  }
};
