import { CommandGeneratorFunction } from "eris";

import { CetusCommand } from ".";

export default class PingCommand extends CetusCommand {
  public constructor () {
    super("ping", { aliases: ["ping", "pong"] });
  }

  public run: CommandGeneratorFunction = msg => {
    const ping = msg.content.substring(msg.prefix!.length) === "ping";

    return msg.channel.createMessage(ping ? "Pong!" : "Ping!");
  }
}
