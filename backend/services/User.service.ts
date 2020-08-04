// Allows emails to be sent, manages email verification
import { send, setApiKey } from "@sendgrid/mail";
import { Request, Response } from "express";

import Roblox from "../api/roblox/Roblox";
import {
  authLife,
  EmailGroup,
  EmailTemplate,
  emailTimeout,
  fromAddress,
  redisPrefixes,
  resendTime
} from "../constants";
import { PartialUser } from "../controllers/AccountController/types";
import database from "../database";
import Auth from "../entities/Auth.entity";
import User from "../entities/User.entity";
import { redis } from "../shared";
import generateToken from "../shared/util/generateToken";
import safeCompare from "../shared/util/safeCompare";
import { ButtonEmailContent, EmailContent } from "../types";

let emailActive: boolean;
if (process.env.sendgridKey) {
  setApiKey(process.env.sendgridKey);
  emailActive = true;
} else {
  console.log("Warning: No sendgrid key. Emails will not function.");
  emailActive = false;
}

export interface EmailVerification {
  lastSend: number, // Date.now() output
  code: string,
  email: string
}

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
      // Set to `lax` so cookie is sent on initial navigation (for email verification and such)
      sameSite: "lax"
    });
    return {
      email: user.email,
      id: user.id,
      created: user.created,
      robloxId: user.robloxId
    };
  }

  // Option to pass user for endpoints like login or register where one isn't set on request
  async sendEmail (type: EmailGroup, content: EmailContent | ButtonEmailContent, optionalUser?: User): Promise<boolean> {
    const targetUser = optionalUser || this.request.user;
    if (!targetUser) {
      throw new Error("Cannot send email - no user provided & no user on request");
    }
    // // generate name
    let name = targetUser.email.split("@")[0];
    if (targetUser.robloxId) {
      const info = await Roblox.getUserInfo(targetUser.robloxId);
      if (info && info.name) {
        name = info.name;
      }
    }

    const toSend:any = { ...content };
    toSend.name = name;

    const templateId = "buttonUrl" in content ? EmailTemplate.button : EmailTemplate.basic;
    const msg = {
      to: targetUser.email,
      from: {
        email: fromAddress,
        name: "Cetus team"
      },
      subject: content.subject,
      templateId,
      dynamicTemplateData: toSend,
      asm: { groupId: type },
      hideWarnings: true
    };
    if (emailActive) {
      try {
        await send(msg);
        return true;
      } catch (e) {
        console.error(e);
        // TODO: Pass it to sentry
        // we don't want ot throw as this would break the response to user, and they don't really need to know if email fails
        if (e.response) {
          console.error(e.response.body);
        }
        return false;
      }
    } else {
      console.log(`(No sendgrid token) - Would send email to ${msg.to} with subject: ${msg.subject}`);
      return false;
    }
  }

  // Used to both to verify emails & resend verification emails
  async verifyEmail (userOverride?: User): Promise<boolean> {
    const user = userOverride || this.request.user;
    if (!user) {
      throw new Error("Cannot verify email - no user on request.");
    }
    const key = redisPrefixes.emailVerification + user.id;

    // Check for in-progress/most recent send
    const raw = await redis.get(key);
    if (raw) {
      const current = JSON.parse(raw) as EmailVerification;
      if (current.email === user.email) {
        // it's for the same email, check when the last request was sent.
        if (Date.now() - current.lastSend < resendTime) {
          return false;
        }
        // to stop spam
      } else if (Date.now() - current.lastSend < (resendTime / 50)) {
        return false;
      }
    }
    const code = await generateToken(50);
    const sent = await this.sendVerificationEmail(code);
    if (sent) {
      const values: EmailVerification = {
        code,
        lastSend: Date.now(),
        email: user.email
      };
      await redis.set(key, JSON.stringify(values), "EX", 60 * 60 * 12);
      return true;
    }
    return false;
  }

  async checkEmailCode (code: string): Promise<boolean> {
    const { user } = this.request;
    if (!user) {
      throw new Error("Cannot verify email - no user on request.");
    }
    const key = redisPrefixes.emailVerification + user.id;

    // Check for in-progress/most recent send
    const raw = await redis.get(key);
    if (raw) {
      const current = JSON.parse(raw) as EmailVerification;
      if (Date.now() - current.lastSend > emailTimeout) {
        await redis.del(key);
        return false;
      }
      if (safeCompare(code, current.code)) {
        await redis.del(key);
        user.emailVerified = true;
        await database.users.save(user);
        return true;
      }
    }
    return false;
  }

  private sendVerificationEmail (code: string): Promise<string|boolean> {
    const url = `${process.env.backendUrl}/account/verify/${encodeURIComponent(code)}`;
    return this.sendEmail(EmailGroup.account, {
      title: "Verify your email",
      subject: "Account: Verify your email",
      buttonText: "Verify your email",
      buttonUrl: url,
      text: `Click the button below to complete your email verification. Can't use the button? Copy this link into your Browser: <a href="${url}">${url}</a>`
    });
  }
}
