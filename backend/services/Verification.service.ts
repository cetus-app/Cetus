import { Request } from "express";

import Roblox from "../api/roblox/Roblox";
import { redisPrefixes } from "../constants";
import { VerifyResponse } from "../controllers/VerificationController";
import database from "../database";
import animals from "../res/animals.json";
import { redis } from "../shared";

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

  async get (rId: number): Promise<Verification[]> {
    if (!this.request.user) throw new Error("No user on request");

    const key = redisPrefixes.verification + rId;

    const raw = await redis.get(key);

    return raw ? JSON.parse(raw) : [];
  }

  async setNewCode (blurb: boolean, userId: string, rId: number): Promise<number | string> {
    if (!this.request.user) throw new Error("No user on request");

    const code = blurb ? this.generateBlurbCode(animals, 8) : Math.floor(1000 + Math.random() * 9000);

    const key = redisPrefixes.verification + rId;

    const raw = await redis.get(key);

    const verifications = raw ? JSON.parse(raw) as Verification[] : [];

    verifications.push({
      code,
      userId
    });

    await redis.set(key, JSON.stringify(verifications), "EX", 60 * 30);

    return code;
  }

  validateCode (code: any): boolean {
    return typeof code === "number" && code >= 1000 && code <= 9999;
  }

  async verify (blurb: boolean, rId: number, code: number | undefined): Promise<VerifyResponse> {
    if (!blurb && !code) throw new Error("Code required when type is game (not blurb)");

    if (blurb && !this.request.user) throw new Error("No user on request");

    const key = redisPrefixes.verification + rId;

    const raw = await redis.get(key);
    if (!raw) {
      return {
        success: false,
        message: "No pending verification found"
      };
    }

    const verifications = JSON.parse(raw) as Verification[];

    // index instead of just element because we need the index later
    let verificationIndex: number;

    if (!blurb) verificationIndex = verifications.findIndex(v => typeof v.code === "number" && v.code === code);

    if (blurb) {
      const userBlurb = await Roblox.getBlurb(rId);

      verificationIndex = verifications.findIndex(v => typeof v.code === "string" && userBlurb.toLowerCase().includes(v.code));
    }

    // TypeScript bug? Variable is always assigned by code above
    if (verificationIndex! < 0) {
      return {
        success: false,
        message: blurb ? "Code not found in profile" : "Incorrect verification code"
      };
    }

    const verification = verifications[verificationIndex!];

    // User exists on request if `blurb` is true, see checks above
    // This check is not strictly necessary, but it stops others from verifying "for someone else"
    // I. e; user who does not own account attempts to complete verification after the owner entered the code in their profile,
    // but before the owner sent a completion request themselves
    if (blurb && this.request.user!.id !== verification.userId) {
      // Fake response for wrong user
      return {
        success: false,
        message: "Code not found in profile"
      };
    }

    const user = await database.users.findOne(verification.userId);

    if (!user) {
      return {
        success: false,
        message: "User does not exist anymore"
      };
    }

    user.robloxId = rId;
    await database.users.save(user);

    verifications.splice(verificationIndex!, 1);

    await redis.set(key, JSON.stringify(verifications), "EX", 60 * 30);


    return {
      success: true,
      message: "Successfully verified"
    };
  }
}
