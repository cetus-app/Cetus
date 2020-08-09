import { ApiError } from "..";
import { InvalidApiKeyError } from "../../shared";
import { authFetch } from "../fetch";
import { SetShoutBody, SetShoutResponse } from "../types";

export const postShout = (guildId: string, body: SetShoutBody): Promise<SetShoutResponse> => (
  authFetch(`${process.env.backendUrl}/v1/roblox/shout`, guildId, {
    method: "PATCH",
    body
  })
    .then(res => res.json())
    .catch(e => {
      if (e instanceof ApiError && (e.response.status === 401 || e.response.status === 403)) throw new InvalidApiKeyError(guildId);

      throw e;
    })
);

export default postShout;
