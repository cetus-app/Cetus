import { createConnection } from "typeorm";

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

const client = new CetusClient(process.env.BOT_TOKEN);

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.connect();
