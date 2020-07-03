/* eslint-disable @typescript-eslint/naming-convention */
import fetch from "node-fetch";

import checkStatus from "../../shared/util/fetchCheckStatus";
import { DiscordOAuth2TokenResponse } from "../../types/discord";

export const BASE_API_URL = "https://discord.com/api";
export const BASE_OAUTH2_URL = `${BASE_API_URL}/oauth2`;

export default class Discord {
  static async getToken (
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
    scope: string
  ): Promise<DiscordOAuth2TokenResponse> {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      scope
    };

    const response = await fetch(`${BASE_OAUTH2_URL}/token`, {
      method: "POST",
      body: new URLSearchParams(data)
    }).then(checkStatus).then(res => res && res.json());

    if (!response) throw new Error("Missing Discord token response");

    return response;
  }
}
