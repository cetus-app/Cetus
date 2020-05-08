import { Request } from "express";

import Roblox from "../api/roblox/Roblox";
import { redisPrefixes } from "../constants";
import { VerifyResponse } from "../controllers/VerificationController";
import database from "../database";
import animals from "../res/animals.json";
import { redis } from "../shared";

export type VerificationType = "game" | "blurb";

export interface Verification {
  userId: string;
  code: number | string;
}

export default class VerificationService {
  constructor (private request: Request) {}

  generateBlurbCode (words: string[], amount: number): string {
    const output = [];

    for (let i = 0; i < amount; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      output.push(words[randomIndex]);
    }

    return output.join(" ");
  }

  async get (rId: number): Promise<Verification | null> {
    const raw = await redis.get(redisPrefixes.verification + rId);
    return raw ? JSON.parse(raw) : null;
  }

  async setNewCode <Type extends VerificationType> (type: Type, userId: string, rId: number): Promise<number | string> {
    const code = type === "game" ? Math.floor(1000 + Math.random() * 9000) : this.generateBlurbCode(animals, 8);

    await redis.set(redisPrefixes.verification + rId, JSON.stringify({
      code,
      userId
    }), "EX", 60 * 30);

    return code;
  }

  validateCode (code: any): boolean {
    return typeof code === "number" && code >= 1000 && code <= 9999;
  }

  async verify <Type extends VerificationType> (type: Type, rId: number, code: Type extends "game" ? number : undefined): Promise<VerifyResponse> {
    const key = redisPrefixes.verification + rId;

    const raw = await redis.get(key);
    if (!raw) {
      return {
        success: false,
        message: "No pending verification found"
      };
    }

    const verification = JSON.parse(raw) as Verification;

    if (type === "game") {
      if (typeof verification.code === "string") {
        return {
          success: false,
          message: "Verification was started using blurb method"
        };
      }

      if (code !== verification.code) {
        return {
          success: false,
          message: "Incorrect verification code"
        };
      }
    }

    if (type === "blurb") {
      if (typeof verification.code === "number") {
        return {
          success: false,
          message: "Verification was started using game method"
        };
      }

      const blurb = await Roblox.getBlurb(rId);

      // Is string if type is blurb
      if (!blurb.includes(verification.code)) {
        return {
          success: false,
          message: "Code not found in profile"
        };
      }
    }

    const user = await database.users.findOne(verification.userId);

    if (!user) {
      return {
        success: false,
        message: "User does not exist anymore"
      };
    }

    user.rId = rId;
    await database.users.save(user);

    await redis.del(key);

    return {
      success: true,
      message: "Successfully verified"
    };
  }
}
