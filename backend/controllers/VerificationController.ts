import {
  IsBoolean, IsNumber, IsString, Max, Min
} from "class-validator";
import {
  Body, HeaderParam, JsonController, Param, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import { redisPrefixes } from "../constants";
import { redis } from "../shared";

class VerifyBody {
  @IsNumber()
  @Min(1000)
  @Max(9999)
  code: number;
}

class VerifyResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}

@JsonController("/verification")
export default class VerificationController {
  @Post("/:rId")
  @ResponseSchema(VerifyResponse)
  // Validation disabled because Roblox has bad (trash) HTTP support
  async verify (@Param("rId") rId: number, @HeaderParam("authorization") token: string, @Body({ validate: false }) { code }: VerifyBody): Promise<VerifyResponse> {
    if (token !== process.env.verificationApiKey) {
      return {
        success: false,
        message: "Fatal configuration error"
      };
    }

    if (!code || code < 1000 || code > 9999) {
      return {
        success: false,
        message: "Invalid verification code"
      };
    }

    const redisKey = redisPrefixes.verification + rId;
    const validCode = await redis.get(redisKey);

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

    await redis.del(redisKey);

    return {
      success: true,
      message: "Successfully verified"
    };
  }
}
