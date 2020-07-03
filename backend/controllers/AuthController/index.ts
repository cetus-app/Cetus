import atob from "atob";
import btoa from "btoa";
import { Request, Response } from "express";
import fetch from "node-fetch";
import {
  BadRequestError, Controller, CookieParam, ForbiddenError, Get, InternalServerError, QueryParam, QueryParams, Redirect, Req, Res
} from "routing-controllers";

import Discord, { BASE_OAUTH2_URL } from "../../api/discord/Discord";
import checkStatus from "../../shared/util/fetchCheckStatus";
import generateToken from "../../shared/util/generateToken";
import { DiscordOAuth2CallbackQuery } from "./types";

const {
  discordClientId, discordClientSecret, backendUrl, frontendUrl, discordBotUrl, discordBotApiKey
} = process.env;
const scope = "bot";
const redirect = `${backendUrl}/auth/callback/discord`;

@Controller("/auth")
export default class AuthController {
  @Get("/discord")
  // Fallback in case an error occurs somewhere
  @Redirect(`${frontendUrl}/auth/discord?success=false`)
  async discordRedirect (@QueryParam("groupKey") groupKey: string, @Res() res: Response, @Req() { secure }: Request): Promise<string> {
    if (!discordClientId || !discordClientSecret) {
      throw new InternalServerError("Fatal configuration error");
    }

    if (!groupKey) {
      throw new BadRequestError();
    }

    const token = await generateToken(25);
    const state = encodeURIComponent(btoa(`${token}:${groupKey}`));

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    res.cookie("state", token, {
      expires,
      httpOnly: true,
      secure
    });

    // Overriden instead of template because routing controllers complains about port not having a replacement (in redirect URI: "http://someurl:1234")
    return `${BASE_OAUTH2_URL}/authorize?client_id=${discordClientId}&scope=${scope}&permissions=67584&response_type=code&state=${state}&redirect_uri=${redirect}`;
  }

  @Get("/callback/discord")
  @Redirect(`${frontendUrl}/auth/discord?bot=:bot&success=:success`)
  async discordCallback (
    @QueryParams() {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code, state, guild_id
    }: DiscordOAuth2CallbackQuery,
    @CookieParam("state") cookieState: string
  ): Promise<{ bot: boolean, success: boolean }> {
    if (!discordClientId || !discordClientSecret || !discordBotApiKey) {
      throw new InternalServerError("Fatal configuration error");
    }

    if (!state) {
      return {
        bot: !!guild_id,
        success: false
      };
    }

    if (!guild_id) {
      // We only care about bot joining for now, normal Discord login is later
      return {
        bot: false,
        success: false
      };
    }

    let parsedState: string;
    try {
      parsedState = atob(state);
    } catch (e) {
      throw new ForbiddenError("Invalid state token");
    }

    const stateParts = parsedState.split(":");

    // No colon in string or invalid
    if (!stateParts[1] || stateParts[0] !== cookieState) {
      throw new ForbiddenError("Invalid state token");
    }

    const { guild: { id } } = await Discord.getToken(discordClientId, discordClientSecret, code, redirect, scope);

    const data = {
      guildId: id,
      key: stateParts[1]
    };

    try {
      await fetch(`${discordBotUrl}/configure/set-key`, {
        method: "POST",
        headers: {
          authorization: discordBotApiKey,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(checkStatus);
    } catch (e) {
      throw new InternalServerError("Discord bot was added to guild but not configured");
    }

    return {
      bot: true,
      success: true
    };
  }
}
