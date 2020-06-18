import { NextFunction, RequestHandler } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { getRepository } from "typeorm";

import { authLife } from "../constants";
import { Auth } from "../entities";

// Handles authentication of requests, and sets req.user.
@Middleware({ type: "before" })
export default class AuthMiddleware implements ExpressMiddlewareInterface {
  use: RequestHandler = async (req, _res, next: NextFunction) => {
    const authRepository = getRepository(Auth);

    const header = req.header("authorization");
    // Header should look like "Bearer [TOKEN]"
    const token = header && header.startsWith("Bearer") ? header.split(" ")[1] : req.cookies.token;

    // An authorization token has been supplied. Verify it.
    const auth = await authRepository.findOne({
      where: { token },
      relations: ["user"]
    });

    if (!auth) return next();

    // User exists. Set it and move on.
    // Check auth age
    const numLife = Number(authLife);
    const oldest = auth.created.getTime() + (numLife * 1000);

    if (oldest < Date.now()) {
      // It's expired.
      await authRepository.remove(auth);
      return next();
    }
    req.user = auth.user;
    return next();
  }
}
