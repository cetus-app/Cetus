import CetusClient from "../CetusClient";
import database from "../database";
import { GuildNotConfiguredError, InvalidApiKeyError } from "../shared";

const errorEvent = async (client: CetusClient, error: Error, shardId: number): Promise<void> => {
  if (error instanceof GuildNotConfiguredError || error instanceof InvalidApiKeyError) {
    const guild = client.guilds.get(error.guildId);
    if (!guild) return;

    const message = error instanceof GuildNotConfiguredError
      ? `A command was issued to me in ${guild.name}, but there is no API key set for your guild. Did you remember to add me to your guild through the Cetus dashboard, which you can find at ${process.env.frontendUrl}?`
      : `An API key is set for your guild (${guild.name}), but it is invalid. This can happen if you accidentally delete the API key in the Cetus dashboard. I will now leave your guild, but you can reconfigure me with a new API key at ${process.env.frontendUrl}`;

    await guild.sendMemberMessage(guild.ownerID, {
      embed: client.generateErrorEmbed({
        description: message,
        fields: [
          {
            name: "Guild",
            value: guild.name
          }
        ],
        url: process.env.frontendUrl
      })
    });

    await database.guilds.delete({ id: guild.id });
    await guild.leave();

    return;
  }

  console.log(`Client error: ${error.message} on shard ${shardId}`);
};

export default errorEvent;
