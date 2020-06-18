import {
  Body, JsonController, Params, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import Roblox, { getGroupClient } from "../../../api/roblox/Roblox";
import database from "../../../database";
import CurrentGroup from "../../../decorators/CurrentGroup";
import { Group } from "../../../entities";
import { IntegrationType } from "../../../entities/Integration.entity";
import { SetRankBody, SetRankResponse, UserRobloxIdParam } from "./types";

@JsonController("/v1/ranking")
export default class RankingV1 {
  @Post("/setRank/:uRbxId")
  @ResponseSchema(SetRankResponse)
  async setRank (
    @Params() { uRbxId }: UserRobloxIdParam,
    @Body() { rank }: SetRankBody,
    @CurrentGroup([IntegrationType.rankingAPI]) group: Group
  ): Promise<SetRankResponse> {
    const user = await database.users.getUserByRId(uRbxId);

    // We know `robloxId` is defined, because we just fetched user by it. TypeScript does not know unfortunately ¯\_(ツ)_/¯
    if (!user || !user.robloxId) {
      return {
        success: false,
        message: "No verified user found"
      };
    }

    const isMember = await Roblox.isMember(group.robloxId, user.robloxId);
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
