import { Request } from "express";

import { redisPrefixes } from "../constants";
import { VerifyResponse } from "../controllers/VerificationController";
import { redis } from "../shared";

export default class VerificationService {
  constructor (private request: Request) {}

  async getCode (rId: number): Promise<string | null> {
    return redis.get(redisPrefixes.verification + rId);
  }

  async setNewCode (rId: number): Promise<number> {
    const code = Math.floor(1000 + Math.random() * 9000);
    await redis.set(redisPrefixes.verification + rId, code, "EX", 60 * 30);
    return code;
  }

  validateCode (code: number): boolean {
    return !!code && code >= 1000 && code <= 9999;
  }

  async verify (rId: number, code: number): Promise<VerifyResponse> {
    const key = redisPrefixes.verification + rId;

    const validCode = await redis.get(key);
    if (!validCode) {
      return {
        success: false,
        message: "No pending verification found"
      };
    }

    if (code !== parseInt(validCode, 10)) {
      return {
        success: false,
        message: "Incorrect verification code"
      };
    }

    await redis.del(key);

    return {
      success: true,
      message: "Successfully verified"
    };
  }
}
