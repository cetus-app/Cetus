import { Validator } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";

import { Auth } from "../entities";
import { errorGenerator, errors } from "../shared";

const validator = new Validator();

// Temporary; where do we put this?
const authLife = 60 * 60 * 12;

const authRepository = getRepository(Auth);

// Handles authentication of requests, and sets req.user.
// TODO: Make it work/convert to services
export default async function checkAuth (req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies || {};
  if (!token || validator.isEmpty(token) || !validator.min(token, 100) || !validator.max(token, 100)) {
    res.status(errors.unauthorized.error.status);
    return res.send(errors.unauthorized);
  }

  // An authorization token has been supplied. Verify it.
  const auth = await authRepository.findOne({
    where: { token },
    relations: ["user"]
  });
  if (!auth) {
    // Invalid auth token.
    res.status(403);
    return res.send(errorGenerator(403, "Forbidden: Invalid authorisation token."));
  }

  // User exists. Set it and move on.
  // Check auth age
  const numLife = Number(authLife);
  const oldest = auth.created.getTime() + (numLife * 1000);

  if (oldest < Date.now()) {
    // It's expired.
    await authRepository.remove(auth);
    res.status(401).send(errorGenerator(401, "Token expired, please login again.", { action: "login" }));
  }

  req.user = auth.user;
  return next();
}
