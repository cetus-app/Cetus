import { Member } from "eris";

import Roblox from "../../../../backend/api/roblox/Roblox";
import { getLink } from "../../../api/aquarius";

Member.prototype.computeGroupNickname = async function computeGroupNickname () {
  const link = await getLink(this.id);
  if (!link) return undefined;

  const username = await Roblox.getUsernameFromId(link.robloxId);
  // This should not happen (Aquarius not trustable? O_o)
  if (!username) return undefined;

  return username;
};
