import { compare, hash } from "bcrypt";
import { Request } from "express";
import {
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  InternalServerError,
  JsonController,
  OnUndefined,
  Params,
  Patch,
  Post,
  Redirect,
  Req,
  UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../api/roblox/Roblox";
import { EmailGroup, hashRounds, redisPrefixes } from "../../constants";
import database from "../../database";
import { User } from "../../entities";
import { csrfMiddleware } from "../../middleware/CSRF";
import { redis } from "../../shared";
import generateToken from "../../shared/util/generateToken";
import { getAuthFromRequest } from "../../shared/util/getAuth";
import {
  ChangeEmailBody,
  ChangePasswordBody,
  DeleteAccountBody,
  FinishPasswordBody,
  ForgotPasswordBody,
  FullUser,
  PartialRobloxUser,
  PartialUser, SignOutBody,
  UserAccessBody,
  VerificationCode
} from "./types";

const { discordInvite, frontendUrl } = process.env;

@JsonController("/account")
@UseBefore(csrfMiddleware)
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
    try {
      await request.userService.verifyEmail(user);
    } catch (e) {
      // Pass it to sentry or something in future - the user does not care about email verification errors for this
      console.log(e);
    }
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

  // Verification emails can be resent by simply making this request with the current email address
  @Patch("/email")
  @OnUndefined(204)
  async changeEmail (@CurrentUser({ required: true }) user: User,
    @Body() { email }: ChangeEmailBody,
    @Req() request: Request) {
    const newUser = { ...user };
    const isResend = email === user.email;
    if (isResend && user.emailVerified) {
      throw new BadRequestError("You have already verified your email.");
    }
    newUser.emailVerified = false;
    newUser.email = email;
    await database.users.save(newUser);

    const invite = discordInvite || "https://cetus.app";
    if (!isResend) {
      await request.userService.sendEmail(EmailGroup.account, {
        title: "Email changed",
        subject: "Email changed",
        text: `Your account's email address was just updated. If you made this change, you can disregard this email. Have a nice day! :) <br>If you did not make this change, please <a href="https://cetus.app/dashboard">Reset your password</a> and revert your email.<br>If you cannot reset your password or access your account, <a href="mailto:account@cetus.app">Contact us</a> <strong>immediately</strong> by email or by <a href="${invite}">joining our Discord.</a>`
      });
    }
    await request.userService.verifyEmail(newUser);
  }


  // https://www.troyhunt.com/everything-you-ever-wanted-to-know/
  // tODO: add recaptcha?
  @Patch("/reset")
  @OnUndefined(204)
  async forgotPassword (
  @Body() { email }: ForgotPasswordBody,
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
    @Body() { password, token }: FinishPasswordBody
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

  // :(
  @Delete("/")
  @OnUndefined(204)
  async deleteAccount (
  @Req() request: Request,
    @CurrentUser({ required: true }) user: User,
    @Body() { password }: DeleteAccountBody
  ) {
    console.log(`Deletion request received for ${user.id}`);
    const moreValues = await database.users.findOne({ id: user.id }, { select: ["hash", "id"] });
    if (!moreValues) {
      throw new Error("Failed to retrieve user for deletion?");
    }// TODO; Cancel stripe billing
    const { hash: userHash } = moreValues;
    const isCorrect = await compare(password, userHash);
    if (!isCorrect) {
      throw new ForbiddenError("Incorrect password");
    }
    console.log(`Deleting user ${user.id}`);
    await request.userService.sendEmail(EmailGroup.account, {
      title: "Account deleted",
      subject: "Account deleted",
      text: `We're sorry to see you go :(<br>Following your request (authenticated with your password) we have deleted your account and all groups on our service. We'll also cancel your billing with our payments provider, Stripe, shortly.<br>This is a permanent change that cannot be reversed. As per our Privacy Policy, your data will not be retained except as required for billing/regulatory compliance. If you did not make this change, <a href="mailto:account@cetus.app">Contact us</a> <strong>immediately</strong> by email or by <a href="${discordInvite}">joining our Discord.</a>`
    });
    await database.users.remove(user);
  }

  @Post("/logout")
  @OnUndefined(204)
  async logout (
  @Req() request: Request,
    @CurrentUser({ required: true }) user: User,
    @Body() { all }: SignOutBody
  ) {
    if (all) {
      const newUser = { ...user };
      const auth = await database.users
        .createQueryBuilder()
        .relation("auth")
        .of(user)
        .loadMany();

      await database.auth.remove(auth);
      await request.userService.completeAuthentication(newUser);
    } else {
      const token = getAuthFromRequest(request);
      const auth = await database.auth.findOne({ where: { token } });
      if (!auth) {
        throw new Error("Failed");
      }
      await database.auth.remove(auth);
    }
  }
}
