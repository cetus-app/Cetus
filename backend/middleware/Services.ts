import { RequestHandler } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

import { GroupService, UserService, VerificationService } from "../services";

@Middleware({ type: "before" })
export default class ServicesMiddleware implements ExpressMiddlewareInterface {
  use: RequestHandler = (request, response, next) => {
    request.verificationService = new VerificationService(request);
    request.userService = new UserService(request, response);
    request.groupService = new GroupService(request);
    return next();
  }
}
