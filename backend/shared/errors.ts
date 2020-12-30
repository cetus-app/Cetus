// This might become a service
// Exports common errors and the generic error handling middleware.


// TODO: Add different error handling based on production or development
// "Unfriendly" error messages.
import { ValidationError } from "class-validator";
import { Response as FetchResponse } from "node-fetch";
import { BadRequestError, HttpError } from "routing-controllers";


interface BasicHttpError {
  error: {
    status: number,
    message: string,
  }
}

// Takes inputs and returns a standard error object. Additional is an object whose properties are merged into the error object.
function errorGenerator (status: number, message: string, additional?: object): BasicHttpError {
  return {
    error: {
      status,
      message,
      ...additional
    }
  };
}


// Contains common errors
const errors = {
  unauthorized: errorGenerator(401, "Unauthorized: Please login or supply authorization token."),
  forbidden: errorGenerator(403, "Forbidden. You do not have access to that resource."),
  notFound: errorGenerator(404, "Page not found."),

  notImplemented: errorGenerator(501, "Not implemented.")
};

export class ExternalHttpError extends Error {
  constructor (response: FetchResponse, ...params: ConstructorParameters<typeof Error>) {
    super(...params);

    Error.captureStackTrace(this, ExternalHttpError);

    this.name = "ExternalHttpError";
    this.response = response;
  }

  response: FetchResponse;
}

export class CustomValidationError extends BadRequestError {
  constructor (errs: ValidationError[]) {
    super("Invalid body, check 'errors' property for more info.");
    this.errors = errs;
  }

  errors: ValidationError[];
}

export class TooManyRequestsError extends HttpError {
  message: string;

  name = "TooManyRequestsError";

  constructor (msg: string) {
    super(429);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    this.message = msg;
  }
}
export { errorGenerator, errors };
