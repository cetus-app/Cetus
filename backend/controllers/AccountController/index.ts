import {compare, hash} from "bcrypt";
import {Request} from "express";
import {
  BadRequestError,
  Body,
  CurrentUser,
  ForbiddenError,
  Get,
  InternalServerError,
  JsonController,
  OnUndefined,
  Params,
  Patch,
  Post,
  Redirect,
  Req
} from "routing-controllers";
import {ResponseSchema} from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import {EmailGroup, hashRounds, redisPrefixes} from "../../constants";
import database from "../../database";
import {User} from "../../entities";
import {redis} from "../../shared";
import generateToken from "../../shared/util/generateToken";
import {
  ChangePasswordBody,
  FinishPasswordRequest,
  ForgotPasswordRequest,
  FullUser,
  PartialRobloxUser,
  PartialUser,
  UserAccessBody,
  VerificationCode
} from "./types";

const { discordInvite, frontendUrl } = process.env;

@JsonController("/account")
export default class Account {
  @Get("/")
  @ResponseSchema(FullUser)
  async getUser (@CurrentUser({ required: true }) user: User): Promise<FullUser> {
    // TODO: Fetch additional props
    return user;
  }

  @Get("/roblox")
  @ResponseSchema(PartialRobloxUser)
  async getRoblox (@CurrentUser({ required: true }) user: User): Promise<PartialRobloxUser> {
    if (!user.robloxId) {
      throw new BadRequestError("Cannot get Roblox info: No Roblox linked.");
    }
    // Perform both requests concurrently
    const usernamePromise = Roblox.getUsernameFromId(user.robloxId);
    const imagePromise = Roblox.getUserImage(user.robloxId);
    const username = await usernamePromise;
    const image = await imagePromise;
    if (username && image) {
      return {
        username,
        image,
        id: user.robloxId
      };
    }
    throw new Error("Failed to get Roblox info for user.");
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
    const existingUser = await database.users.findOne({ email }, { select: ["hash", "id", "robloxId", "email", "created"] });
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

  @Patch("/password")
  @OnUndefined(204)
  async changePassword (@CurrentUser({ required: true }) user: User,
                        @Body() { currentPassword, password }: ChangePasswordBody,
                @Req() request: Request) {
    const hashUser = await database.users.findOne({ id: user.id }, { select: ["hash"] });
    if (!hashUser || !hashUser.hash) {
      throw new InternalServerError("No hash obtained?");
    }
    if (!await compare(currentPassword, hashUser.hash)) {
      throw new ForbiddenError("Incorrect current password");
    }
    const newPassHash = await hash(password, hashRounds);
    const newUser = { ...user };
    newUser.hash = newPassHash;
    await database.users.save(newUser);

    const invite = discordInvite || "https://cetus.app";
    await request.userService.sendEmail(EmailGroup.account, {
      title: "Account password changed",
      subject: "Password updated",
      text: `Your account's password was just updated. If you made this change, you can disregard this email. Have a nice day! :) <br>If you did not make this change, <a href="https://cetus.app/dashboard">Reset your password</a>.<br>If you cannot reset your password, <a href="mailto:account@cetus.app">Contact us</a> <strong>immediately</strong> by email or by <a href="${invite}">joining our Discord.</a>`
    });
  }


  // https://www.troyhunt.com/everything-you-ever-wanted-to-know/
  // tODO: add recaptcha?
  @Patch("/reset")
  @OnUndefined(204)
  async forgotPassword (
                        @Body() { email }: ForgotPasswordRequest,
                        @Req() request: Request
  ) {
    // Additional values are selected for the email sender
    const user = await database.users.findOne({ email }, { select: ["hash", "id", "email", "robloxId"] });
    if (user) {
      // Act on it
      // We don't throw a error because we don't want them to do know whether or not an email is sent
      const code = await generateToken(50);

      const url = `${frontendUrl}/dashboard/finish-reset?t=${encodeURIComponent(code)}`;
      await request.userService.sendEmail(EmailGroup.account, {
        title: "Password reset requested",
        subject: "Password reset request",
        text: `We have received a request to reset your password on our service. To reset your password, click the button below or copy this URL into your browser: <a href="${url}">Reset your password</a>.<br>If you did not initiate this request, you can safely ignore this email.This link will expire in 1 hour.<br><br>Need help? <a href="${discordInvite}">Join our Discord</a>.`,
        buttonText: "Reset your password",
        buttonUrl: url
      }, user);
      const key = redisPrefixes.passwordReset + code;

      await redis.set(key, user.id, "EX", 60 * 60);
    }
  }

  @Patch("/finish-reset")
  @OnUndefined(204)
  async finishReset (
      @Req() request: Request,
      @Body() { password, token }: FinishPasswordRequest
  ) {
    // Additional values are selected for the email sender
    const key = redisPrefixes.passwordReset + token;
    const userId = await redis.get(key);
    if (!userId) {
      throw new BadRequestError("Invalid token: Expired or invalid token.");
    }
    await redis.del(key);
    const user = await database.users.getUser(userId);
    if (!user) {
      throw new Error("Invalid stored userId mapped to token");
    }
    user.hash = await hash(password, hashRounds);
    await database.users.save(user);
    // Pretty redundant since the Link was sent to email anyway
    await request.userService.sendEmail(EmailGroup.account, {
      title: "Account password reset",
      subject: "Password reset",
      text: `Your account's password was just reset via. your email. If you made this change, you can disregard this email. Have a nice day! :) <br>If you did not make this change, <a href="https://cetus.app/dashboard">Reset your password</a>.<br>If you cannot reset your password, <a href="mailto:account@cetus.app">Contact us</a> <strong>immediately</strong> by email or by <a href="${discordInvite}">joining our Discord.</a>`
    }, user);
  }
}
