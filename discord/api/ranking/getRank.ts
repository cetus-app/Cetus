import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { authFetch } from "../fetch";
import { UserMembership } from "../types";

export const getRank = (guildId: string, uRbxId: number): Promise<UserMembership> => (
  authFetch(`${process.env.backendUrl}/v1/ranking/${uRbxId}`, guildId)
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default getRank;
