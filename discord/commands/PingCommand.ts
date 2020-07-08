import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from ".";
import CetusClient from "../CetusClient";

export default class PingCommand extends CetusCommand {
  public constructor (client: CetusClient) {
    super("ping", { aliases: ["ping", "pong"] }, client);
  }

  public run: CommandGeneratorFunction = msg => {
    const ping = msg.content.substring(msg.prefix!.length) === "ping";

    return msg.channel.createMessage(ping ? "Pong!" : "Ping!");
  }
}
