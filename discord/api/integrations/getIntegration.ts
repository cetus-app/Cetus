import { ApiError, authFetch } from "..";
import { REDIS_PREFIXES } from "../../constants";
import { InvalidApiKeyError } from "../../shared";
import { getObject, setObject } from "../../shared/redis";
import { DiscordIntegration } from "../types";

export const fetchIntegration = async (guildId: string): Promise<DiscordIntegration> => (
  authFetch(`${process.env.backendUrl}/integrations/type/DISCORD_BOT`, guildId)
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403 || e.response.status === 404)) {
        throw new InvalidApiKeyError(guildId, "Guild is configured with invalid API key or the Discord integration is not enabled");
      }

      throw e;
    })
);

export const getIntegration = async (guildId: string): Promise<DiscordIntegration> => {
  const key = REDIS_PREFIXES.integrationConfig + guildId;
  const cached = await getObject(key);

  if (cached) return cached;

  const config = await fetchIntegration(guildId);
  if (config) await setObject(key, config, "EX", 60 * 30);

  return config;
};

export default getIntegration;
