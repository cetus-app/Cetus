import { compare, hash } from "bcrypt";
import { Response } from "express";
import {
  BadRequestError,
  Body, ForbiddenError,
  JsonController,
  Post,
  Res
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { authLife } from "../../constants";

// import Roblox from "../../api/roblox/Roblox";
import { hashRounds } from "../../constants";
import database from "../../database";
import { User } from "../../entities";
import { PartialUser, UserAccessBody } from "./types";
import generateToken from "../../shared/util/generateToken";
import Auth from "../../entities/Auth.entity";


@JsonController("/account")
export default class Account {
  @Post("/")
  @ResponseSchema(User)
  async register (
    @Body() { email, password }: UserAccessBody,
  @Res() response: Response
  ): Promise<PartialUser> {
    // Check that email is not in use
    const existingUser = await database.users.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("The email you provided is already in use on another account.");
    }

    // Hash password
    const hashedPassword = await hash(password, hashRounds);

    const user = new User();
    user.email = email;
    user.hash = hashedPassword;
    await database.users.save(user);

    // Generate secret
    const AuthKey = new Auth();
    const secret = await generateToken(100);
    AuthKey.token = secret;
    AuthKey.user = user;

    // Send email

    response.cookie("token", secret, {
      maxAge: authLife,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    return {
      email,
      id: user.id,
      emailVerified: user.emailVerified,
      created: user.created
    };
  }

  @Post("/login")
  @ResponseSchema(User)
  async login (@Body() { email, password }: UserAccessBody, @Res() response: Response): Promise<PartialUser> {
    // Check that email is not in use
    const existingUser = await database.users.findOne({ email });
    if (!existingUser) {
      throw new ForbiddenError("Incorrect email or password");
    }

    // Hash password
    const isCorrect = await compare(password, existingUser.hash);
    if (!isCorrect) {
      throw new ForbiddenError("Incorrect email or password");
    }
  }
}
