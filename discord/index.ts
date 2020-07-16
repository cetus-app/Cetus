import { createConnection } from "typeorm";

import "./extensions/Eris";
import CetusClient from "./CetusClient";
import server from "./server";

if (!process.env.BOT_TOKEN) {
  console.error("Bot token missing");
  process.exit(1);
}

createConnection().then(() => {
  const port = process.env.port || 5000;

  server.listen(port, () => console.log(`App listening on port ${port}`));
});

const client = new CetusClient(process.env.BOT_TOKEN, undefined, {
  prefix: "!",
  defaultCommandOptions: {
    cooldownExclusions: { guildIDs: [process.env.devGuildId || ""] },
    cooldownMessage: "Chill, you have used this command too often.",
    cooldownReturns: 2,
    permissionMessage: "You are not allowed to use that command!"
  }
});

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.connect();
