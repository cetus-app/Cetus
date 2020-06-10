import realFetch from "node-fetch";

import { redisPrefixes } from "../../constants";
import { ExternalHttpError, redis } from "../../shared";
import camelify from "../../shared/util/camelify";
import checkStatus from "../../shared/util/fetchCheckStatus";
import { RobloxGroup, RobloxUser, UserRobloxGroup } from "../../types";

const fetch = (url: string, opt?: any) => {
  console.log(`${(opt && opt.method) || "GET"} ${url}`);
  return realFetch(url, opt);
};


export const BASE_API_URL = "https://api.roblox.com";
export const USERS_API_URL = "https://users.roblox.com";

export default class Roblox {
  static async getIdFromUsername (username: string): Promise<number | undefined> {
    const url = `${BASE_API_URL}/users/get-by-username?username=${username}`;
    try {
      const data = await fetch(url).then(checkStatus).then(res => res && res.json());

      if (data) {
        if (data.Id) return data.Id;

        if (data.success === false && data.errorMessage && data.errorMessage.toLowerCase() === "user not found") return undefined;
      }

      // Is caught below
      throw new Error();
    } catch (e) {
      console.error(e);
      throw new ExternalHttpError(url, "Error while getting ID from username");
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
}
