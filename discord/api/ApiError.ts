import { Response } from "node-fetch";

export default class ApiError extends Error {
  constructor (response: Response, message?: string) {
    super(message);

    this.name = "ApiError";
    this.response = response;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  readonly response: Response;
}
