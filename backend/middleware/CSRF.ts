import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "routing-controllers";

import generateToken from "../shared/util/generateToken";

export async function csrfMiddleware (req: Request, res: Response, next: NextFunction): Promise<any> {
  // CSRF Protection
  const protectedMethods = ["post", "patch", "put", "delete"];

  if (protectedMethods.includes(req.method.toLowerCase())) {
    // Validate CSRF presence
    const cookieToken = req.cookies["CSRF-Token"];
    const headerToken = req.get("CSRF-Token");
    if (cookieToken && headerToken) {
      if (cookieToken === decodeURIComponent(headerToken)) {
        return next();
      }
    }
    // Sent manually due to routing-controllers bug
    // https://github.com/typestack/routing-controllers/issues/563
    const e = new BadRequestError("Failed CSRF Token validation");
    return res.status(e.httpCode).send(e);
  }

  // It's a GET, Options or HEAD etc.
  if (!req.cookies["CSRF-Token"]) {
    res.cookie("CSRF-Token", await generateToken(25), {
      domain: process.env.cookieDomain,
      maxAge: 172800000,
      sameSite: "strict",
      httpOnly: false
    });
  }
  return next();
}
export default csrfMiddleware;
