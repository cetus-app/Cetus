import fetch from "node-fetch";

import { ExternalHttpError } from "../../shared";
import checkStatus from "../../shared/util/fetchCheckStatus";

export const BASE_API_URL = "https://api.roblox.com";
export const USERS_API_URL = "https://users.roblox.com";

export default class Roblox {
  static async getIdFromUsername (username: string): Promise<number | undefined> {
    const url = `${BASE_API_URL}/users/get-by-username?username=${username}`;
    const data = await fetch(url).then(checkStatus).then(res => res.json());

    if (data.Id) return data.Id;

    if (data.success === false && data.errorMessage && data.errorMessage.toLowerCase() === "user not found") return undefined;

    throw new ExternalHttpError(url, "Error while getting ID from username");
  }

  static async getBlurb (id: number): Promise<string> {
    const url = `${USERS_API_URL}/v1/users/${id}`;
    const data = await fetch(url).then(checkStatus).then(res => res && res.json());

    if (!data) throw new Error("Invalid ID passed to `getBlurb`");

    return data.description;
  }
}
