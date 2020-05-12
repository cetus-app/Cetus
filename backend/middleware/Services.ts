import { RequestHandler } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

import { VerificationService } from "../services";
import UserService from "../services/User.service";

@Middleware({ type: "before" })
export default class ServicesMiddleware implements ExpressMiddlewareInterface {
  use: RequestHandler = (request, response, next) => {
    request.verificationService = new VerificationService(request);
    request.userService = new UserService(request, response);
    return next();
  }
}
