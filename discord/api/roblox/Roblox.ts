import realFetch, { Headers, RequestInit } from "node-fetch";

import { REDIS_PREFIXES } from "../../constants";
import { ExternalHttpError, client as redis } from "../../shared";
import { camelify, checkStatus } from "../../shared/util";
import {
  FullRobloxRole, RobloxGroup, RobloxUser, UserRobloxGroup
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

export default class Roblox {
  static async getUsernameFromId (id: number): Promise<string | undefined> {
    const key = REDIS_PREFIXES.idToUsernameCache + id;
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
    const key = REDIS_PREFIXES.userImageCache + id;
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
    const key = REDIS_PREFIXES.usernameToIdCache + username;
    const cached = await redis.get(key);
    if (cached) return parseInt(cached, 10);

    const id = await this.fetchIdFromUsername(username);

    if (id) {
      await redis.set(key, `${id}`, "EX", 60 * 60 * 24);
      return id;
    }

    return undefined;
  }

  static async fetchIdFromUsername (username: string): Promise<number | undefined> {
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
    const key = REDIS_PREFIXES.groupCache + groupId;
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
    const key = REDIS_PREFIXES.userGroupsCache + userId;
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
    const key = REDIS_PREFIXES.groupRolesCache + groupId;

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
}
