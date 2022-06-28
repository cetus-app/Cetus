import { captureMessage } from "@sentry/node";

import RobloxBot from "./api/roblox/RobloxBot";
import { Bot } from "./entities";

const initialiseBots = async (bots: Bot[]): Promise<RobloxBot[]> => {
  const promises: Promise<RobloxBot>[] = [];

  const safeBots: Bot[] = bots.slice(0, 2);
  let rest: Bot[] | null = null;
  if (bots.length > 2) {
    rest = bots.slice(2);
  }

  for (const bot of safeBots) {
    if (!bot.dead) {
      const promise = RobloxBot.getClient(bot);
      promises.push(promise);
    }
  }
  const mapped = promises.map(p => p.catch(e => {
    if (e.response && e.response.status === 403) {
      if (process.env.NODE_ENV === "production") {
        captureMessage("Failed to login: A bot has an invalid cookie.");
      }

      return console.error(`Failed to login client: Invalid cookie!`);
    }
    return console.error("Error logging in with bot", e);
  }));
  const clients = (await Promise.all(mapped)).filter(c => !!c) as RobloxBot[];
  if (rest) {
    // Ratelimits?
    return new Promise(resolve => {
      setTimeout(async () => {
        const restClients = await initialiseBots(rest!);
        resolve([...clients, ...restClients]);
      }, 4000);
    });
  }
  return clients;
};

export default initialiseBots;
