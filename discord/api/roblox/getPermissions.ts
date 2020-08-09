import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { GroupPermissions } from "../../types";
import { authFetch } from "../fetch";

export const getPermissions = (guildId: string, userId: number): Promise<GroupPermissions> => (
  authFetch(`${process.env.backendUrl}/v1/roblox/permissions/${userId}`, guildId)
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default getPermissions;
