import {
  Body, Get, JsonController, Params, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox, { getGroupClient } from "../../../api/roblox/Roblox";
import CurrentGroup from "../../../decorators/CurrentGroup";
import { Group } from "../../../entities";
import {
  GetRankResponse, SetRankBody, SetRankResponse, UserRobloxIdParam
} from "./types";

@JsonController("/v1/ranking")
export default class RankingV1 {
  @Get("/:uRbxId")
  @ResponseSchema(GetRankResponse)
  async getRank (@Params() { uRbxId }: UserRobloxIdParam, @CurrentGroup() group: Group): Promise<GetRankResponse> {
    const userGroup = await Roblox.getUserGroup(uRbxId, group.robloxId);

    const rank = userGroup?.rank || 0;
    const role = userGroup?.role || "Guest";

    return {
      rank,
      role
    };
  }

  @Post("/setRank/:uRbxId")
  @ResponseSchema(SetRankResponse)
  async setRank (
    @Params() { uRbxId }: UserRobloxIdParam,
    @Body() { rank }: SetRankBody,
    @CurrentGroup() group: Group
  ): Promise<SetRankResponse> {
    const isMember = await Roblox.isMember(group.robloxId, uRbxId);
    if (!isMember) {
      return {
        success: false,
        message: "User is not a member of group"
      };
    }

    const client = await getGroupClient(group.id);

    return client.setRank(uRbxId, rank).then(() => ({
      success: true,
      message: "User's rank is updated"
    })).catch(e => {
      console.error(e);

      return {
        success: true,
        message: "Roblox error occurred while setting rank (does the rank exist?)"
      };
    });
  }
}
