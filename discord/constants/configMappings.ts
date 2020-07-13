import { GuildChannel, Role } from "eris";

import { DiscordBotConfig } from "../api/types";

export type ConfigDiscordType = typeof Role | typeof GuildChannel;

export interface ConfigMapping {
  key: Exclude<keyof DiscordBotConfig, "guildId" | "binds">;
  type: ConfigDiscordType;
}

export const CONFIG_MAPPINGS: { [name: string ]: ConfigMapping} = {
  unverified: {
    key: "unverifiedRoleId",
    type: Role
  },
  verified: {
    key: "verifiedRoleId",
    type: Role
  }
};
