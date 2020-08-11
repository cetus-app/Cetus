/* eslint-disable @typescript-eslint/naming-convention */

import {
  ClientOptions, CommandClient, CommandClientOptions, EmbedOptions, User
} from "eris";

import commands from "./commands";
import { AQUARIUS_VERIFY_URL, BRAND_COLOURS } from "./constants";
import { error, guildMemberAdd, messageCreate } from "./events";

export default class CetusClient extends CommandClient {
  constructor (token: string, options?: ClientOptions, commandOptions?: CommandClientOptions) {
    super(token, options, commandOptions);

    this.registerEvents();
    this.registerCommands();
  }

  private registerEvents (): void {
    this.on("guildMemberAdd", (...params) => guildMemberAdd(this, ...params));
    this.on("messageCreate", (...params) => messageCreate(...params));
    this.on("error", (...params) => error(this, ...params));
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

  public generateNotVerifiedEmbed (options?: EmbedOptions): EmbedOptions {
    return this.generateErrorEmbed({
      title: "Not verified",
      description: `You are not verified, go to ${AQUARIUS_VERIFY_URL} to link your Roblox account.`,
      url: AQUARIUS_VERIFY_URL,
      ...options
    });
  }

  // TODO: Replace with regular expression?
  public parseMention (mention: string): User | undefined {
    if (!mention.startsWith("<@") || !mention.endsWith(">")) return undefined;

    let id = mention.slice(2, -1);

    // Mention includes exclamation mark if user has nickname
    if (id.startsWith("!")) id = id.slice(1);

    return this.users.get(id);
  }
}
