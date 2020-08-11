import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { authFetch } from "../fetch";
import { SetRankResponse } from "../types";

export const setRank = (guildId: string, uRbxId: number, rank: number): Promise<SetRankResponse> => (
  authFetch(`${process.env.backendUrl}/v1/roblox/setRank/${uRbxId}`, guildId, {
    method: "POST",
    body: { rank }
  })
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default setRank;
