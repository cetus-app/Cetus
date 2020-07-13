import "./Guild";
import "./Member";
import { DiscordBotConfig } from "../../api/types";
import { ConfigDiscordType } from "../../constants";
import { PropertiesOfType } from "../../types";

declare module "eris" {
  interface Guild {
    getConfigs (): Promise<DiscordBotConfig>;
    getConfig <K extends keyof DiscordBotConfig>(key: K): Promise<DiscordBotConfig[K]>;
    setConfigs (config: Partial<DiscordBotConfig>): Promise<void>;
    setConfig <K extends keyof DiscordBotConfig>(key: K, value: DiscordBotConfig[K]): Promise<void>;
    getConfigValue <T extends ConfigDiscordType> (
      type: T,
      // Only allow keys that have a string value
      key: PropertiesOfType<InstanceType<T>, string>,
      compare: string
    ): InstanceType<T> | undefined;
  }

  interface Member {
    computeGroupRoles (): Promise<{ verified: boolean, add: Role[], remove: Role[], unusualConfig: boolean }>;

    setGroupRoles (): Promise<{ verified: boolean, added: Role[], removed: Role[], unusualConfig: boolean }>;

    computeGroupNickname (): Promise<string | undefined>;
  }
}
