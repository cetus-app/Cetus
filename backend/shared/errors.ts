// This might become a service
// Exports common errors and the generic error handling middleware.


// TODO: Add different error handling based on production or development
// "Unfriendly" error messages.
import { NextFunction, Request, Response } from "express";
import { Response as FetchResponse } from "node-fetch";
import {ValidationError} from "class-validator";
import {BadRequestError} from "routing-controllers";

function errorHandler (error: any, _req: Request, res: Response, _next: NextFunction):any {
  if (error instanceof SyntaxError) {
    // do your own thing here 👍
    res.status(400).send(errorGenerator(400, "Bad JSON."));
  } else {
    console.error(`Error catch`, error);
    res.status(error.status || 500);
    return res.send(errorGenerator(500, error.message));
  }
}

interface HttpError {
  error: {
    status: number,
    message: string,
  }
}

// Takes inputs and returns a standard error object. Additional is an object whose properties are merged into the error object.
function errorGenerator (status: number, message: string, additional?: object): HttpError {
  return {
    error: {
      status,
      message,
      ...additional
    }
  };
}

/*
  This is an error wrapper. It wraps express route functions and catches any async errors that are thrown.
  (i.e. the promise rejects)
  It then passes this error along to the global error handler so it can be dealt with consistently,
  by returning a 500.
 */
const errorCatch = (fn: Function) => (
  (req: Request, res: Response, next: NextFunction) => {
    const routePromise = fn(req, res, next);
    if (routePromise && routePromise.catch) {
      routePromise.catch((err: Error) => { next(err); console.log("Route error caught", err.message); });
    }
  }
);


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
export {
  errorHandler, errorGenerator, errors, errorCatch
};
