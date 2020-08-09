import { DiscordBotConfig } from "../../api/types";
import { ConfigDiscordType, ConfigMappings } from "../../constants";
import { PropertiesOfType } from "../../types";

import "./Guild";
import "./Member";

declare module "eris" {
  interface Guild {
    fetchMember (id: string): Promise<Member | undefined>;

    sendMemberMessage (id: string, ...messageArgs: Parameters<PrivateChannel["createMessage"]>): ReturnType<PrivateChannel["createMessage"]>;

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

    handleInvalidConfig (
      key: keyof DiscordBotConfig,
      friendlyKey: keyof ConfigMappings,
      type: ConfigDiscordType
    ): Promise<void>;
    handleInvalidBindRole (bind: DiscordBotConfig["binds"][number]): Promise<void>;
  }

  interface Member {
    getName (): string;

    computeGroupRoles (): Promise<{ verified: boolean, add: Role[], remove: Role[], unusualConfig: boolean }>;
    setGroupRoles (): Promise<{ verified: boolean, added: Role[], removed: Role[], unusualConfig: boolean }>;

    computeGroupNickname (): Promise<string | undefined>;
  }
}
