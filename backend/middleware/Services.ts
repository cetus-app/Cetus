import { RequestHandler } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

import { VerificationService } from "../services";

@Middleware({ type: "before" })
export default class ServicesMiddleware implements ExpressMiddlewareInterface {
  use: RequestHandler = (request, _response, next) => {
    request.verificationService = new VerificationService(request);
    return next();
  }
}
