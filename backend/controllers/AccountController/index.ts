import { compare, hash } from "bcrypt";
import { Request } from "express";
import {
  BadRequestError, Body, CurrentUser, ForbiddenError, Get, JsonController, Params, Post, Redirect, Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";


import { hashRounds } from "../../constants";
import database from "../../database";
import { User } from "../../entities";
import {
  FullUser, PartialUser, UserAccessBody, VerificationCode
} from "./types";


@JsonController("/account")
export default class Account {
  @Get("/")
  @ResponseSchema(FullUser)
  async getUser (@CurrentUser({ required: true }) user: User): Promise<FullUser> {
    // TODO: Fetch additional props
    return user;
  }

  @Post("/")
  @ResponseSchema(PartialUser)
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
  @ResponseSchema(PartialUser)
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

  // When this is set up it will redirect to the dashboard itself
  @Get("/verify/:code")
  @Redirect(`${process.env.frontendUrl}?success=true`)
  async verify (@CurrentUser({ required: true }) _user: User,
                @Params({ validate: true }) { code }: VerificationCode,
                @Req() request: Request) {
    const succ = await request.userService.checkEmailCode(code);
    return `${process.env.frontendUrl}/dashboard?emailVerified=${succ}`;
  }

  @Get("/test")
  async test (@CurrentUser({ required: true }) _user: User) {
    throw new Error("Oops - something broke.");
  }
}
