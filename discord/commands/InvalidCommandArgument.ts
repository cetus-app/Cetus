export default class InvalidCommandArgument<T> extends Error {
  constructor (argName: string, argValue: T, message?: string) {
    super(message);

    this.name = "InvalidCommandArgument";
    this.argName = argName;
    this.argValue = argValue;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, InvalidCommandArgument.prototype);
  }

  readonly argName: string;

  readonly argValue: T;
}
