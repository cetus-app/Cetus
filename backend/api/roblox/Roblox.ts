import fetch from "node-fetch";

import { ExternalHttpError } from "../../shared";
import checkStatus from "../../shared/util/fetchCheckStatus";

export const BASE_API_URL = "https://api.roblox.com";

export default class Roblox {
  static async getIdFromUsername (username: string): Promise<number | undefined> {
    const url = `${BASE_API_URL}/users/get-by-username?username=${username}`;
    const data = await fetch(url).then(checkStatus).then(res => res.json());

    if (data.Id) return data.Id;

    if (data.success === false && data.errorMessage && data.errorMessage.toLowerCase() === "user not found") return undefined;

    throw new ExternalHttpError(url, "Error while getting ID from username");
  }
}
