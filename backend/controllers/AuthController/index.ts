import atob from "atob";
import btoa from "btoa";
import { Request, Response } from "express";
import fetch from "node-fetch";
import {
  BadRequestError, Controller, CookieParam, ForbiddenError, Get, InternalServerError, QueryParam, QueryParams, Redirect, Req, Res
} from "routing-controllers";

import Discord, { BASE_OAUTH2_URL } from "../../api/discord/Discord";
import database from "../../database";
import { DiscordBotConfig, IntegrationType } from "../../entities/Integration.entity";
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
  // @Redirect(`${frontendUrl}/auth/discord?bot=:bot&success=:success`)
  @Redirect(frontendUrl!)
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

    const key = await database.keys.findOne({
      where: { token: stateParts[1] },
      relations: ["group", "group.integrations", "group.owner"]
    });

    if (!key) {
      throw new ForbiddenError();
    }

    const integration = await key.group.integrations.find(i => i.type === IntegrationType.discordBot);

    if (!integration) {
      throw new ForbiddenError();
    }

    const { guild: { id } } = await Discord.getToken(discordClientId, discordClientSecret, code, redirect, scope);

    const config = integration.config as DiscordBotConfig;

    // Handle guild transfers in the future, for now forbid any guild that isn't the one already set
    // Cannot use guild ID from query parameters because they cannot be trusted
    if (!!config.guildId && config.guildId !== id) {
      // TODO: Send request to bot to leave the guild it just joined (will join after Discord receives token request)
      // Could skip this as well and let bot handle leaving any guild without set API key
      throw new ForbiddenError();
    }

    const data = {
      guildId: id,
      key: stateParts[1]
    };

    return fetch(`${discordBotUrl}/configure/set-key`, {
      method: "POST",
      headers: {
        authorization: discordBotApiKey,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(checkStatus).then(async () => {
      config.guildId = id;
      integration.config = config;
      await database.integrations.save(integration);

      return {
        bot: true,
        success: true
      };
    }).catch(() => {
      throw new InternalServerError("Discord bot was added to guild but not configured");
    });
  }
}
