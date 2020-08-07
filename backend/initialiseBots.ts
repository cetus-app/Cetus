import Roblox, { InvalidRobloxCookie } from "./api/roblox/Roblox";
import database from "./database";
import { Bot } from "./entities";

// I know this type definition is confusing
// Declares a `const` that takes `bot` as a parameter *AND* returns a new function that takes the error as a parameter
// `(e: any) => Promise<never>` is the type of `catchFn`
const catchFn = (bot: Bot): ((e: any) => Promise<never>) => async (e: any) => {
  if (e instanceof InvalidRobloxCookie) {
    await database.bots.save({
      ...bot,
      dead: true
    });
    throw new Error(`Bot ${bot.id} has invalid cookie`);
  }

  throw e;
};

const initialiseBots = async (bots: Bot[]): Promise<Roblox[]> => {
  const clients: Roblox[] = [];
  const promises: Promise<void>[] = [];

  for (const bot of bots) {
    if (!bot.dead) {
      const client = new Roblox(bot);
      clients.push(client);

      const promise = client.login(bot.cookie).catch(catchFn(bot));
      promises.push(promise);
    }
  }

  await Promise.all(promises.map(p => p.catch(e => console.error("Error logging in with bot", e))));

  return clients;
};

export default initialiseBots;
