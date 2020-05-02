import {
  IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min
} from "class-validator";
import {
  Authorized, BadRequestError, Body, HeaderParam, JsonController, Param, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import { redisPrefixes } from "../constants";
import { redis } from "../shared";

class StartBody {
  @IsString()
  @IsNotEmpty()
  username: string;
}

class StartResponse {
  @IsNumber()
  rId: number;

  @IsNumber()
  code: number;
}

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
  @Post("/")
  @ResponseSchema(StartResponse)
  @Authorized()
  async start (@Body() { username }: StartBody): Promise<StartResponse> {
    //  const rId = await Roblox.getIdFromUsername(username);
    const rId = 1;

    if (!rId) throw new BadRequestError(`No Roblox account found for username ${username}`);

    const redisKey = redisPrefixes.verification + rId;
    const existing = await redis.get(redisKey);

    if (existing) {
      return {
        rId,
        code: parseInt(existing, 10)
      };
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    await redis.set(redisKey, code.toString());

    return {
      rId,
      code
    };
  }

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
