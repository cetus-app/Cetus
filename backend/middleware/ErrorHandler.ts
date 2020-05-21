import * as Sentry from "@sentry/node";
import { ErrorRequestHandler } from "express";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";

const sentryMiddleware = Sentry.Handlers.errorHandler();

@Middleware({ type: "after" })
export default class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error: ErrorRequestHandler = (error, request, response, next) => {
    // Do not pass client error to default error handler
    if (error instanceof HttpError && error.httpCode < 500) return next();
    return sentryMiddleware(error, request, response, next);
  }
}
