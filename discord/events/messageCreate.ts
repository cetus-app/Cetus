import { Message } from "eris";

const messageCreate = (message: Message): void => {
  if (message.content.toLowerCase() === "ping") message.channel.createMessage("Pong!");

  if (message.content.toLowerCase() === "pong") message.channel.createMessage("Ping!");
};

export default messageCreate;
