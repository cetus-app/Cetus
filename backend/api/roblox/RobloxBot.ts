import { Headers, RequestInit, Response } from "node-fetch";

import { cetusGroupId } from "../../constants";
import database from "../../database";
import { Bot } from "../../entities";
import { ExternalHttpError } from "../../shared";
import checkStatus from "../../shared/util/fetchCheckStatus";
import { AUTH_API_URL, fetch, GROUPS_API_URL } from "./Roblox";

export class InvalidRobloxCookie extends Error {
  constructor (...params: ConstructorParameters<typeof Error>) {
    super(...params);

    Error.captureStackTrace(this, ExternalHttpError);

    this.name = "InvalidRobloxCookie";
  }
}

export default class RobloxBot {
  readonly dbBot: Bot;

  private csrfToken: string;

  private static readonly instances: Map<string, RobloxBot> = new Map<string, RobloxBot>();

  private constructor (bot: Bot) {
    this.dbBot = bot;
  }

  static async getClient (bot: Bot): Promise<RobloxBot> {
    if (bot.dead) throw new Error(`Bot ${bot.id} is dead`);

    let client = this.instances.get(bot.id);
    if (!client) {
      client = new RobloxBot(bot);

      try {
        await client.login();
        this.instances.set(bot.id, client);
      } catch (e) {
        if (e instanceof InvalidRobloxCookie) {
          await database.bots.save({
            id: bot.id,
            dead: true
          });

          throw new Error(`Bot ${bot.id} has invalid cookie`);
        }

        throw e;
      }
    }

    return client;
  }

  private async login (): Promise<void> {
    try {
      await this.authHttp(`${GROUPS_API_URL}/v1/groups/${cetusGroupId}/audit-log`).then(checkStatus).then(res => res && res.json());
    } catch (e) {
      if (e instanceof ExternalHttpError && e.response.status === 401) throw new InvalidRobloxCookie("Invalid login cookie");
      throw e;
    }

    setInterval(() => this.refreshCookie().catch(async e => {
      if (e instanceof InvalidRobloxCookie) {
        // Clients are not instantiated without an active bot
        this.dbBot!.dead = true;
        await database.bots.save(this.dbBot);
        throw new Error(`Bot ${this.dbBot.id} has invalid cookie`);
      }

      throw e;
    // 1 week
    }), 1000 * 60 * 60 * 24 * 7);


    return undefined;
  }

  private async refreshCookie (): Promise<string> {
    try {
      const res = await this.authHttp("https://www.roblox.com/authentication/signoutfromallsessionsandreauthenticate", { method: "POST" }).then(checkStatus);

      const cookies = res?.headers.get("set-cookie");

      // Definitely not from Noblox source
      const cookie = cookies?.match(/\.ROBLOSECURITY=(.*?);/)?.[1];

      if (!cookie) throw new Error("Failed to retrieve new cookie");

      this.dbBot.cookie = cookie;
      this.dbBot.cookieUpdated = new Date();
      await database.bots.save(this.dbBot);

      return cookie;
    } catch (e) {
      // Roblox responds with bad request for invalid authentication on this endpoint
      if (e instanceof ExternalHttpError && e.response.status === 400) throw new InvalidRobloxCookie("Current cookie is invalid");
      throw e;
    }
  }

  async authHttp (url: string, opts: RequestInit = {}): Promise<Response> {
    const newOpts = opts;
    newOpts.headers = new Headers(opts.headers);
    newOpts.headers.append("Cookie", `.ROBLOSECURITY=${this.dbBot.cookie}`);

    if (!this.csrfToken) {
      try {
        const res = await fetch(`${AUTH_API_URL}/v2/logout`, {
          method: "POST",
          headers: newOpts.headers
        }).then(checkStatus);

        if (!res) throw new Error("Unknown error occurred while fetching CSRF token");
      } catch (e) {
        if (e instanceof ExternalHttpError && RobloxBot.csrfFailed(e.response)) this.csrfToken = e.response.headers.get("x-csrf-token") || "";
        else throw e;
      }
    }

    newOpts.headers.set("x-csrf-token", this.csrfToken);

    return fetch(url, newOpts).then(res => {
      if (RobloxBot.csrfFailed(res)) {
        const header = res.headers.get("x-csrf-token");
        if (!header) throw new ExternalHttpError(res, "CSRF token validation failed, but was unable to retrieve new token");

        this.csrfToken = header;

        return this.authHttp(url, opts);
      }

      return res;
    });
  }

  private static csrfFailed (res: Response): boolean {
    return res.status === 403 && res.statusText.toLowerCase().includes("token validation failed");
  }
}
