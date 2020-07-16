/* eslint-disable @typescript-eslint/naming-convention */

export interface DiscordOAuth2BotGuild {
  // There are a shit ton of other properties here, but we only care about the guild ID
  id: string;
}

export interface DiscordOAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  guild?: DiscordOAuth2BotGuild;
}

// More properties here, but we do not need them yet
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
  verified?: boolean;
}
