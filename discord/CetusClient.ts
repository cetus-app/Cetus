import { ClientOptions, CommandClient, CommandClientOptions } from "eris";

import commands from "./commands";
import { messageCreate } from "./events";

export default class CetusClient extends CommandClient {
  constructor (token: string, options?: ClientOptions, commandOptions?: CommandClientOptions) {
    super(token, options, commandOptions);

    this.registerEvents();
    this.registerCommands();
  }

  private registerEvents (): void {
    this.on("messageCreate", (...params) => messageCreate(...params));
  }

  private registerCommands (): void {
    // It is a class, linter also complains if constructor starts with lowercase qq
    // eslint-disable-next-line @typescript-eslint/naming-convention
    for (const Command of commands) {
      const command = new Command();
      this.registerCommand(command.label, command.run, command.options);
    }
  }
}
