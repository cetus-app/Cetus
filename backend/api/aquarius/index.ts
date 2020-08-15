import { fetch } from "..";
import { AQUARIUS_API_URL, redisPrefixes } from "../../constants";
import { ExternalHttpError } from "../../shared";
import { getObject, setobject } from "../../shared/redis";

export interface AquariusLink {
  discordId: string;
  robloxId: number;
}

export const fetchLink = (id: string): Promise<AquariusLink | undefined> => (
  fetch(`${AQUARIUS_API_URL}/roblox/${id}`).then(res => res && res.json()).catch(e => {
    if (e instanceof ExternalHttpError && (e.response.status === 400 || e.response.status === 404)) return undefined;

    throw e;
  })
);

export const getLink = async (id: string): Promise<AquariusLink | undefined> => {
  const key = redisPrefixes.aquariusLink + id;
  const cached = await getObject(key);

  if (cached) return cached;

  const link = await fetchLink(id);
  if (link) await setobject(key, link, "EX", 60 * 30 * 3);

  return link;
};
