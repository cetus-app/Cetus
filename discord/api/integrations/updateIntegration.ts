import { ApiError, authFetch } from "..";
import { redis } from "../../../backend/shared";
import { REDIS_PREFIXES } from "../../constants";
import { InvalidApiKeyError } from "../../shared";
import { DiscordBotConfig, DiscordIntegration } from "../types";

export const updateIntegration = async (guildId: string, config: Partial<DiscordBotConfig>): Promise<DiscordIntegration> => (
  authFetch(`${process.env.backendUrl}/integrations/type/"DISCORD_BOT"`, guildId, {
    method: "PATCH",
    body: { config }
  })
    .then(async res => {
      await redis.del(REDIS_PREFIXES.integrationConfig + guildId);

      return res.json();
    })
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403 || e.response.status === 404)) {
        throw new InvalidApiKeyError(guildId, "Guild is configured with invalid API key or the Discord integration is not enabled");
      }

      throw e;
    })
);

export default updateIntegration;
