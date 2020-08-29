import RobloxBot from "./api/roblox/RobloxBot";
import { Bot } from "./entities";

const initialiseBots = async (bots: Bot[]): Promise<RobloxBot[]> => {
  const promises: Promise<RobloxBot>[] = [];

  for (const bot of bots) {
    if (!bot.dead) {
      const promise = RobloxBot.getClient(bot);
      promises.push(promise);
    }
  }

  const clients = await Promise.all(promises.map(p => p.catch(e => console.error("Error logging in with bot", e))));

  return clients.filter(c => !!c) as RobloxBot[];
};

export default initialiseBots;
