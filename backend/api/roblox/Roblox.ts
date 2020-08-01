import { max, min } from "class-validator";
import realFetch, { Headers, RequestInit, Response } from "node-fetch";
import { BadRequestError, ForbiddenError } from "routing-controllers";

import { cetusGroupId, redisPrefixes } from "../../constants";
import database from "../../database";
import { Group } from "../../entities";
import { ExternalHttpError, redis } from "../../shared";
import camelify from "../../shared/util/camelify";
import checkStatus from "../../shared/util/fetchCheckStatus";
import {
  FullRobloxRole, RobloxGroup, RobloxUser, Shout, UserRobloxGroup
} from "../../types";

const fetch = (url: string, opt?: RequestInit) => {
  const newOpt = opt || {};

  console.log(`${newOpt.method || "GET"} ${url}`);

  if (newOpt.body) {
    newOpt.headers = new Headers(newOpt.headers);
    newOpt.headers.append("Content-Type", "application/json");
  }

  return realFetch(url, opt);
};

export const BASE_API_URL = "https://api.roblox.com";
export const USERS_API_URL = "https://users.roblox.com";
export const GROUPS_API_URL = "https://groups.roblox.com";
export const THUMBNAILS_API_URL = "https://thumbnails.roblox.com";
export const AUTH_API_URL = "https://auth.roblox.com";

export class InvalidRobloxCookie extends Error {
  constructor (...params: ConstructorParameters<typeof Error>) {
    super(...params);

    Error.captureStackTrace(this, ExternalHttpError);

    this.name = "InvalidRobloxCookie";
  }
}

export default class Roblox {
  constructor (group: Group) {
    this.group = group;
  }

  private group: Group;

  private cookie: string;

  private csrfToken: string;

  async login (cookie: string): Promise<void> {
    this.cookie = cookie;

    try {
      await this.authHttp(`${GROUPS_API_URL}/v1/groups/${cetusGroupId}/audit-log`).then(checkStatus).then(res => res && res.json());
    } catch (e) {
      if (e instanceof ExternalHttpError && e.response.status === 401) throw new InvalidRobloxCookie("Invalid login cookie");
      throw e;
    }

    setInterval(() => this.refreshCookie().catch(async e => {
      if (e instanceof InvalidRobloxCookie) {
        // Clients are not instantiated without an active bot
        this.group.bot!.dead = true;
        await database.bots.save(this.group.bot!);
        throw new Error(`Group ${this.group.id} has invalid cookie`);
      }

      throw e;
    // 24 hours
    }), 1000 * 60 * 60 * 24);


    return undefined;
  }

  async refreshCookie (): Promise<string> {
    try {
      const res = await this.authHttp("https://www.roblox.com/authentication/signoutfromallsessionsandreauthenticate", { method: "POST" }).then(checkStatus);

      const cookies = res?.headers.get("set-cookie");

      // Definitely not from Noblox source
      const cookie = cookies?.match(/\.ROBLOSECURITY=(.*?);/)?.[1];

      if (!cookie) throw new Error("Failed to retrieve new cookie");

      this.cookie = cookie;

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

    if (this.cookie) newOpts.headers.append("Cookie", `.ROBLOSECURITY=${this.cookie}`);

    if (!this.csrfToken) {
      try {
        const res = await fetch(`${AUTH_API_URL}/v2/logout`, {
          method: "POST",
          headers: newOpts.headers
        }).then(checkStatus);

        if (!res) throw new Error("Unknown error occurred while fetching CSRF token");
      } catch (e) {
        if (e instanceof ExternalHttpError && Roblox.csrfFailed(e.response)) this.csrfToken = e.response.headers.get("x-csrf-token") || "";
        else throw e;
      }
    }

    newOpts.headers.set("x-csrf-token", this.csrfToken);

    return fetch(url, newOpts).then(res => {
      if (Roblox.csrfFailed(res)) {
        const header = res.headers.get("x-csrf-token");
        if (!header) throw new ExternalHttpError(res, "CSRF token validation failed, but was unable to retrieve new token");

        this.csrfToken = header;

        return this.authHttp(url, opts);
      }

      return res;
    });
  }

  static csrfFailed (res: Response): boolean {
    return res.status === 403 && res.statusText.toLowerCase().includes("token validation failed");
  }

  static async getUsernameFromId (id: number): Promise<string | undefined> {
    const key = redisPrefixes.idToUsernameCache + id;
    const cached = await redis.get(key);
    if (cached) return cached;

    const username = await this.fetchUsernameFromId(id);

    if (username) {
      await redis.set(key, username, "EX", 60 * 60 * 2);
      return username;
    }

    return undefined;
  }

  static fetchUsernameFromId (id: number): Promise<string | undefined> {
    return fetch(`${BASE_API_URL}/users/${id}`).then(checkStatus).then(res => res && res.json())
      .then(data => data?.Username)
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        if (e instanceof ExternalHttpError && e.response.status === 400) return undefined;

        console.error(`Error while fetching username from ID ${id}`, e);
        return undefined;
      });
  }

  static async getUserImage (id: number): Promise<string | undefined> {
    const key = redisPrefixes.userImageCache + id;
    const cached = await redis.get(key);
    if (cached) return cached;

    const imageUrl = await this.fetchUserImage(id);

    if (imageUrl) {
      await redis.set(key, imageUrl, "EX", 60 * 60 * 5);
      return imageUrl;
    }

    return undefined;
  }

  static fetchUserImage (id: number): Promise<string | undefined> {
    return fetch(`${THUMBNAILS_API_URL}/v1/users/avatar-bust?userIds=${id}&size=75x75&format=Png&isCircular=true`).then(checkStatus).then(res => res && res.json())
      .then(data => data.data && data.data[0] && data.data[0].imageUrl)
      .catch(e => {
        // Roblox responds with 400 for invalid IDs or deleted users
        if (e instanceof ExternalHttpError && e.response.status === 400) return undefined;

        console.error(`Error while fetching user bust from ID ${id}`, e);
        return undefined;
      });
  }

  static async getIdFromUsername (username: string): Promise<number | undefined> {
    try {
      const data = await fetch(`${BASE_API_URL}/users/get-by-username?username=${username}`).then(checkStatus).then(res => res && res.json());

      if (data) {
        if (data.Id) return data.Id;

        if (data.success === false && data.errorMessage && data.errorMessage.toLowerCase() === "user not found") return undefined;
      }

      // Is caught below
      throw new Error();
    } catch (e) {
      console.error(e);
      throw new Error("Error while getting ID from username");
    }
  }

  static async getBlurb (id: number): Promise<string> {
    const url = `${USERS_API_URL}/v1/users/${id}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error("Invalid ID passed to `getBlurb`");

    return data.description;
  }

  // Caches
  static async getGroup (groupId: number): Promise<RobloxGroup | undefined> {
    const key = redisPrefixes.groupCache + groupId;
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as RobloxGroup;
    }
    const group = await this.fetchGroup(groupId);
    if (group) {
      // One hour cache time
      await redis.set(key, JSON.stringify(group), "EX", 60 * 60);
      return group;
    }
    return undefined;
  }

  static async fetchGroup (groupId: number): Promise<RobloxGroup | undefined> {
    const url = `${BASE_API_URL}/groups/${groupId}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    // Data is undefined for 404
    return data ? camelify(data) : data;
  }

  static getUserInfo (userId: number): Promise<RobloxUser | undefined> {
    const url = `${USERS_API_URL}/v1/users/${userId}`;
    // Data is undefined for 404
    return fetch(url).then(checkStatus).then(res => res && res.json());
  }

  static async getUserGroups (userId: number): Promise<UserRobloxGroup[] | undefined> {
    const key = redisPrefixes.userGroupsCache + userId;
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const groups = await this.fetchUserGroups(userId);
    if (groups) {
      // One hour cache time
      await redis.set(key, JSON.stringify(groups), "EX", 60 * 60);
      return groups;
    }
    return undefined;
  }

  static async fetchUserGroups (userId: number): Promise<UserRobloxGroup[] | undefined> {
    const url = `${BASE_API_URL}/users/${userId}/groups`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (data) {
      const outGroups: UserRobloxGroup[] = [];
      for (const group of data) {
        outGroups.push(camelify(group));
      }
      return outGroups;
    }

    return undefined;
  }

  static async isMember (groupId: number, userId: number): Promise<boolean> {
    const groups = await this.getUserGroups(userId);
    if (!groups) return false;

    const groupIds = groups.map(g => g.id);
    return groupIds.includes(groupId);
  }

  static async getRoles (groupId: number): Promise<FullRobloxRole[] | undefined> {
    const key = redisPrefixes.groupRolesCache + groupId;

    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const roles = await this.fetchRoles(groupId);

    if (roles) {
      await redis.set(key, JSON.stringify(roles), "EX", 60 * 60);
      return roles;
    }

    return undefined;
  }

  static async fetchRoles (groupId: number): Promise<FullRobloxRole[] | undefined> {
    const data = await fetch(`${GROUPS_API_URL}/v1/groups/${groupId}/roles`).then(checkStatus).then(res => res && res.json());
    return data?.roles;
  }

  static async getUserGroup (userId: number, groupId: number): Promise<UserRobloxGroup | undefined> {
    const groups = await this.getUserGroups(userId);
    if (!groups) return undefined;

    return groups.find(g => g.id === groupId);
  }

  async setRank (userId: number, rank: number): Promise<void> {
    if (!min(rank, 0) || !max(rank, 255)) throw new TypeError("Rank must not be smaller than 0 or larger than 255");

    const roles = await Roblox.getRoles(this.group.robloxId);
    if (!roles) throw new Error(`Unknown error occurred while getting roles in group ${this.group.robloxId}`);

    const { id: roleId } = roles.find(r => r.rank === rank) || {};
    if (!roleId) throw new BadRequestError(`Role with rank ${rank} does not exist in group ${this.group.robloxId}`);

    const body = JSON.stringify({ roleId });

    const data = await this.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/users/${userId}`, {
      method: "PATCH",
      body
    }).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error(`Unknown error while updating user ${userId} to rank ${rank} in group ${this.group.robloxId}`);

    if (data.errors && data.errors.length > 0) {
      const firstErr = data.errors[0].message;
      throw new Error(`Error(s) occurred while updating user ${userId} to rank ${rank} in group ${this.group.robloxId}: ${firstErr}`);
    }

    return undefined;
  }

  async exile (userId: number): Promise<void> {
    const data = await this.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/users/${userId}`, { method: "DELETE" }).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error(`Unknown error while exiling ${userId} from group ${this.group.robloxId}`);

    if (data.errors && data.errors.length > 0) {
      const firstErr = data.errors[0].message;
      if (firstErr.code === 3) {
        throw new BadRequestError("User does not exist");
      }
      throw new Error(`Error(s) occurred while exiling ${userId} from group ${this.group.robloxId}: ${firstErr.message}`);
    }

    return undefined;
  }

  async setShout (newShout: string): Promise<Shout> {
    const body = { message: newShout };
    const data = await this.authHttp(`${GROUPS_API_URL}/v1/groups/${this.group.robloxId}/status/`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }).then(checkStatus).then(res => res && res.json());


    if (data.errors && data.errors.length > 0) {
      const err = data.errors[0];
      if (err.code === 6) {
        // Not authorised
        throw new ForbiddenError("Bot does not have permission to post shout");
      } else if (err.code === 7) {
        throw new BadRequestError(err.message || "Roblox rejected shout content");
      }
      throw new Error(`Error(s) occurred while posting shout to ${this.group.robloxId}: ${err.message}`);
    }
    const { body: message, poster, updated } = data;
    return {
      message,
      poster,
      updated
    };
  }
}

const clients: Map<string, Roblox> = new Map();

export const getGroupClient = async (groupId: string): Promise<Roblox> => {
  let client = clients.get(groupId);
  if (client) return client;

  const group = await database.groups.getGroupWithCookie(groupId);
  if (!group) throw new Error(`Group ${groupId} not found`);

  if (!group.bot || group.bot.dead) throw new Error(`Group ${groupId} does not have active bot`);

  client = new Roblox(group);

  return client.login(group.bot.cookie).then(() => {
    // Client was just defined
    clients.set(group.id, client!);
    return client!;
  }).catch(async e => {
    if (e instanceof InvalidRobloxCookie) {
      // Litterally a condition for this
      group.bot!.dead = true;
      await database.bots.save(group.bot!);
      throw new Error(`Group ${groupId} has invalid cookie`);
    }

    throw e;
  });
};
