import { authFetch } from "..";
import { DiscordIntegration } from "../types";

export const getConfig = async (guildId: string): Promise<DiscordIntegration> => {
  const response = await authFetch(`${process.env.backendUrl}/integrations/type/"DISCORD_BOT"`, guildId);
  return response.json();
};

export default getConfig;
