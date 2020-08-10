import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { authFetch } from "../fetch";
import { ExileUserResponse } from "../types";

export const exileUser = (guildId: string, userId: number): Promise<ExileUserResponse> => (
  authFetch(`${process.env.backendUrl}/v1/roblox/exile/${userId}`, guildId, { method: "DELETE" })
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default exileUser;
