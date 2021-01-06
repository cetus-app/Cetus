import { NextFunction, RequestHandler } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { getRepository } from "typeorm";

import { authLife } from "../constants";
import { Auth } from "../entities";
import { getAuthFromRequest } from "../shared/util/getAuth";

// Handles authentication of requests, and sets req.user.
@Middleware({ type: "before" })
export default class AuthMiddleware implements ExpressMiddlewareInterface {
  use: RequestHandler = async (req, _res, next: NextFunction) => {
    const authRepository = getRepository(Auth);

    const token = getAuthFromRequest(req);

    // an authorization token has been supplied. Verify it.
    const auth = await authRepository.createQueryBuilder("auth")
      .leftJoinAndSelect("auth.user", "user")
      .addSelect("user.stripeCustomerId")
      .addSelect("user.email")
      .where("auth.token = :token", { token })
      .getOne();


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
