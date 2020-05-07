import {
  IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min
} from "class-validator";
import { Request } from "express";
import {
  Authorized, BadRequestError, Body, HeaderParam, InternalServerError, JsonController, Param, Post, Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../api/roblox/Roblox";

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

export class VerifyResponse {
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
  async start (@Body() { username }: StartBody, @Req() { verificationService }: Request): Promise<StartResponse> {
    try {
      const rId = await Roblox.getIdFromUsername(username);

      if (!rId) throw new BadRequestError(`No Roblox account found for username ${username}`);

      const existing = await verificationService.getCode(rId);

      if (existing) {
        return {
          rId,
          code: parseInt(existing, 10)
        };
      }

      const code = await verificationService.setNewCode(rId);

      return {
        rId,
        code
      };
    } catch (e) {
      throw new InternalServerError(e.message);
    }
  }

  @Post("/:rId")
  @ResponseSchema(VerifyResponse)
  // Validation disabled because Roblox has bad (trash) HTTP support
  async verify (@Param("rId") rId: number, @HeaderParam("authorization") token: string, @Body({ validate: false }) { code }: VerifyBody, @Req() { verificationService }: Request): Promise<VerifyResponse> {
    if (token !== process.env.verificationApiKey) {
      return {
        success: false,
        message: "Fatal configuration error"
      };
    }

    if (!verificationService.validateCode(code)) {
      return {
        success: false,
        message: "Invalid verification code"
      };
    }

    return verificationService.verify(rId, code);
  }
}
