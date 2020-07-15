export default class InvalidApiKeyError extends Error {
  constructor (guildId: string, message?: string) {
    super(message);

    this.name = "InvalidApiKeyError";
    this.guildId = guildId;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, InvalidApiKeyError.prototype);
  }

  readonly guildId: string;
}
