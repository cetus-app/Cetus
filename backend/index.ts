// Entry point for backend
import "reflect-metadata";
import { createConnection } from "typeorm";

import init from "./actionManager";
import app from "./app";
import { Bot } from "./entities";
import initialiseBots from "./initialiseBots";

createConnection().then(async connection => {
  const port = process.env.port || 4000;

  app.listen(port, () => console.log(`App listening on port ${port}`));

  console.log("Initialising bots..");

  // Database helper might not be initialised yet
  const bots = await connection.getRepository(Bot).find({ select: ["id", "robloxId", "cookie", "cookieUpdated", "dead"] });

  const clients = await initialiseBots(bots);
  const ids = clients.map(c => c.dbBot.robloxId).join(", ");

  console.log(`Successfully initialised the following bots:\n${ids}`);

  init();
});
