import { captureMessage } from "@sentry/node";

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
  const mapped = promises.map(p => p.catch(e => {
    if (e.response.status === 403) {
      if (process.env.NODE_ENV === "production") {
        captureMessage("Failed to login: A bot has an invalid cookie.");
      }

      return console.error(`Failed to login client: Invalid cookie!`);
    }
    return console.error("Error logging in with bot", e);
  }));
  const clients = await Promise.all(mapped);
  return clients.filter(c => !!c) as RobloxBot[];
};

export default initialiseBots;
