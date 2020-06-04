import {
  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min
} from "class-validator";
import { Request } from "express";
import {
  Authorized, BadRequestError, Body, CurrentUser, HeaderParam, InternalServerError, JsonController, Param, Post, QueryParams, Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../api/roblox/Roblox";
import { User } from "../entities";
import database from "../database";

class StartBody {
  @IsString()
  @IsNotEmpty()
  username: string;
}

class StartQuery {
  @IsOptional()
  @IsBoolean()
  blurb: boolean = false;
}

class StartResponse {
  @IsNumber()
  rId: number;

  @IsNumber()
  @IsOptional()
  code?: number;

  @IsString()
  @IsOptional()
  blurbCode?: string;
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
  async start (
    @QueryParams() { blurb }: StartQuery,
    @Body() { username }: StartBody,
    @Req() { verificationService }: Request,
    @CurrentUser({ required: true }) user: User
  ): Promise<StartResponse> {
    if (user.robloxId) throw new BadRequestError("Already verified");

    let rId: number | undefined;

    try {
      rId = await Roblox.getIdFromUsername(username);
    } catch (e) {
      throw new InternalServerError(e.message);
    }

    if (!rId) throw new BadRequestError(`No Roblox account found for username ${username}`);

    const existingUser = await database.users.findOne({ robloxId: rId });
    if (existingUser) {
      throw new BadRequestError("That Roblox account is already associated with another user. If you own this Roblox account but did not create this user on our service, please contact us.");
    }

    const verifications = await verificationService.get(rId);
    const existing = await verifications.find(v => v.userId === user.id);

    if (existing) {
      return {
        rId,
        code: typeof existing.code === "number" ? existing.code : undefined,
        blurbCode: typeof existing.code === "string" ? existing.code : undefined
      };
    }

    const code = await verificationService.setNewCode(blurb, user.id, rId);

    return {
      rId,
      code: typeof code === "number" ? code : undefined,
      blurbCode: typeof code === "string" ? code : undefined
    };
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

    // TODO: Websocket event?

    return verificationService.verify(false, rId, code);
  }

  @Post("/blurb/:rId")
  @ResponseSchema(VerifyResponse)
  @Authorized()
  async verifyBlurb (@Param("rId") rId: number, @Req() { verificationService }: Request): Promise<VerifyResponse> {
    return verificationService.verify(true, rId, undefined);
  }

  // Method is called by client after in-game verification is completed, which means it is not stored in Redis
  // (thus check if user has Roblox ID set)
  @Post("/check/:rId")
  @ResponseSchema(VerifyResponse)
  @Authorized()
  async check (@CurrentUser({ required: true }) user: User, @Param("rId") rId: number, @Req() { verificationService }: Request): Promise<VerifyResponse> {
    if (user.robloxId) {
      return {
        success: true,
        message: "Successfully verified"
      };
    }

    const existing = await verificationService.get(rId);

    if (!existing) {
      return {
        success: false,
        message: "No pending verification found"
      };
    }

    return {
      success: false,
      message: "Not verified"
    };
  }
}
