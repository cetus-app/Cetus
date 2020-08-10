import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { RobloxGroup } from "../../types";
import { authFetch } from "../fetch";

export const getGroupInfo = (guildId: string): Promise<RobloxGroup> => (
  authFetch(`${process.env.backendUrl}/v1/roblox/info`, guildId)
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default getGroupInfo;
