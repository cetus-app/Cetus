import { Client, ClientOptions } from "eris";

import { messageCreate } from "./events";

export default class CetusClient extends Client {
  constructor (token: string, options?: ClientOptions) {
    super(token, options);

    this.registerEvents();
  }

  private registerEvents (): void {
    this.on("messageCreate", (...params) => messageCreate(...params));
  }
}
