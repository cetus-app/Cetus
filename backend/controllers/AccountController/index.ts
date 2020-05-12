import { compare, hash } from "bcrypt";
import { Request } from "express";
import {
  BadRequestError,
  Body, ForbiddenError,
  JsonController,
  Post,
  Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";


import { hashRounds } from "../../constants";
import database from "../../database";
import { User } from "../../entities";
import { PartialUser, UserAccessBody } from "./types";


@JsonController("/account")
export default class Account {
  @Post("/")
  @ResponseSchema(User)
  async register (
    @Body() { email, password }: UserAccessBody,
  @Req() request: Request
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


    // Send email

    // Finish
    // eslint-disable-next-line no-return-await
    return await request.userService.completeAuthentication(user);
  }

  @Post("/login")
  @ResponseSchema(User)
  async login (@Body() { email, password }: UserAccessBody, @Req() request: Request): Promise<PartialUser> {
    // Check that email is not in use
    const existingUser = await database.users.findOne({ email }, { select: ["hash", "id", "email", "created"] });
    if (!existingUser) {
      throw new ForbiddenError("Incorrect email or password");
    }

    const isCorrect = await compare(password, existingUser.hash);
    if (!isCorrect) {
      throw new ForbiddenError("Incorrect email or password");
    }

    return request.userService.completeAuthentication(existingUser);
  }
}
