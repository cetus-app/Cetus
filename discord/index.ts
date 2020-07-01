import CetusClient from "./CetusClient";

if (!process.env.BOT_TOKEN) {
  console.error("Bot token missing");
  process.exit(1);
}

const client = new CetusClient(process.env.BOT_TOKEN);

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.connect();
