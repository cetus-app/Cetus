import { ApiError, fetch } from "..";
import { AQUARIUS_API_URL, REDIS_PREFIXES } from "../../constants";
import { getObject, setObject } from "../../shared";

export interface AquariusLink {
    discordId: string;
    robloxId: number;
}

export const fetchLink = (id: string): Promise<AquariusLink | undefined> => (
  fetch(`${AQUARIUS_API_URL}/roblox/${id}`).then(res => res.json()).catch(e => {
    if (e instanceof ApiError && (e.response.status === 400 || e.response.status === 404)) return undefined;

    throw e;
  })
);

export const getLink = async (id: string): Promise<AquariusLink | undefined> => {
  const key = REDIS_PREFIXES.aquariusLink + id;
  const cached = await getObject(key);

  if (cached) return cached;

  const link = await fetchLink(id);
  if (link) await setObject(key, link, "EX", 60 * 30 * 3);

  return link;
};
