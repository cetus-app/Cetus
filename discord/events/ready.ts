import { Guild } from "eris";

import CetusClient from "../CetusClient";
import database from "../database";

const getAndSetPrefix = async (client: CetusClient, guild: Guild): Promise<void> => {
  const prefix = await guild.getConfig("prefix");
  if (prefix) client.registerGuildPrefix(guild.id, prefix);
};

const readyEvent = async (client: CetusClient): Promise<void> => {
  const dbGuilds = await database.guilds.find();

  const promises: Promise<void>[] = [];

  for (const dbGuild of dbGuilds) {
    const guild = client.guilds.get(dbGuild.id);
    if (!guild) {
      console.log(`Guild ${dbGuild.id} is stored, but bot is not in it`);
    } else {
      promises.push(getAndSetPrefix(client, guild));
    }
  }
};

export default readyEvent;
