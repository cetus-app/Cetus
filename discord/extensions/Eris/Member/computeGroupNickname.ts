import { Member } from "eris";

import { getLink } from "../../../api/aquarius";
import Roblox from "../../../api/roblox/Roblox";

Member.prototype.computeGroupNickname = async function computeGroupNickname () {
  const link = await getLink(this.id);
  if (!link) return undefined;

  const username = await Roblox.getUsernameFromId(link.robloxId);
  // This should not happen (Aquarius not trustable? O_o)
  if (!username) return undefined;

  return username;
};
