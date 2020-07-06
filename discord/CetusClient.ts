import { ClientOptions, CommandClient, CommandClientOptions } from "eris";

import { messageCreate } from "./events";

export default class CetusClient extends CommandClient {
  constructor (token: string, options?: ClientOptions, commandOptions?: CommandClientOptions) {
    super(token, options, commandOptions);

    this.registerEvents();
  }

  private registerEvents (): void {
    this.on("messageCreate", (...params) => messageCreate(...params));
  }
}
