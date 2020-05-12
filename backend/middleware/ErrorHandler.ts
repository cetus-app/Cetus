import { ErrorRequestHandler } from "express";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";

@Middleware({ type: "after" })
export default class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error: ErrorRequestHandler = (error, _request, _response, next) => {
    // Do not pass client error to default error handler
    if (error instanceof HttpError && error.httpCode < 500) return next();

    // Pass internal errors to default handler
    return next(error);
  }
}
