// Allows emails to be sent, manages email verification
import { Request, Response } from "express";

import { authLife } from "../constants";
import { PartialUser } from "../controllers/AccountController/types";
import database from "../database";
import Auth from "../entities/Auth.entity";
import User from "../entities/User.entity";
import generateToken from "../shared/util/generateToken";

export default class UserService {
  constructor (private request: Request, private response: Response) {
  }

  // User is passed as no authorization middleware is present on those routes so req.user isn't set.
  async completeAuthentication (user: User): Promise<PartialUser> {
    const { response } = this;
    const authKey = new Auth();
    const secret = await generateToken(100);
    authKey.token = secret;
    authKey.user = user;
    await database.auth.save(authKey);

    response.cookie("token", secret, {
      maxAge: authLife,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    return {
      email: user.email,
      id: user.id,
      created: user.created
    };
  }
}
