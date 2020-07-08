/* eslint-disable @typescript-eslint/naming-convention */

import {
  ClientOptions, CommandClient, CommandClientOptions, EmbedOptions
} from "eris";

import commands from "./commands";
import { BRAND_COLOURS } from "./constants";
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
      const command = new Command(this);
      this.registerCommand(command.label, command.run, command.options);
    }
  }

  public generateEmbed (options?: EmbedOptions): EmbedOptions {
    return {
      color: BRAND_COLOURS.primary,
      author: {
        name: this.user.username,
        icon_url: this.user.avatarURL
      },
      footer: { text: "Cetus Discord" },
      ...options
    };
  }

  public generateWarningEmbed (options?: EmbedOptions): EmbedOptions {
    return this.generateEmbed({
      title: "Warning",
      color: BRAND_COLOURS.warning,
      ...options
    });
  }

  public generateErrorEmbed (options?: EmbedOptions): EmbedOptions {
    return this.generateEmbed({
      title: "Error",
      color: BRAND_COLOURS.danger,
      ...options
    });
  }
}
