import fetch from "node-fetch";

import { ExternalHttpError } from "../../shared";
import camelify from "../../shared/util/camelify";
import checkStatus from "../../shared/util/fetchCheckStatus";
import { RobloxGroup, RobloxUser, UserRobloxGroup } from "../../types";

export const BASE_API_URL = "https://api.roblox.com";
export const USERS_API_URL = "https://users.roblox.com";

export default class Roblox {
  static async getIdFromUsername (username: string): Promise<number | undefined> {
    const url = `${BASE_API_URL}/users/get-by-username?username=${username}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (data) {
      if (data.Id) return data.Id;

      if (data.success === false && data.errorMessage && data.errorMessage.toLowerCase() === "user not found") return undefined;
    }
    throw new ExternalHttpError(url, "Error while getting ID from username");
  }

  static async getBlurb (id: number): Promise<string> {
    const url = `${USERS_API_URL}/v1/users/${id}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error("Invalid ID passed to `getBlurb`");

    return data.description;
  }

  static async getGroupInfo (groupId: number): Promise<RobloxGroup | undefined> {
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
}
