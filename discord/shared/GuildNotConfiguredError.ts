export default class GuildNotConfiguredError extends Error {
  constructor (guildId: string, message?: string) {
    super(message);

    this.name = "GuildNotConfiguredError";
    this.guildId = guildId;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, GuildNotConfiguredError.prototype);
  }

  readonly guildId: string;
}
