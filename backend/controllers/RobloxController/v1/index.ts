import {
  BadRequestError,
  Body, Delete, Get, JsonController, Params, Patch, Post, UseBefore
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import Roblox from "../../../api/roblox/Roblox";
import { redisPrefixes } from "../../../constants";
import CurrentGroup from "../../../decorators/CurrentGroup";
import { Group } from "../../../entities";
import RatelimitMiddleware from "../../../middleware/Ratelimit";
import { redis } from "../../../shared";
import {
  ExileUserResponse,
  GetRankResponse,
  GroupPermissions,
  RobloxGroup,
  SetRankBody,
  SetRankResponse,
  SetShoutBody,
  SetShoutResponse,
  UserRobloxIdParam
} from "./types";

@OpenAPI({ security: [{ apiKeyAuth: [] }] })
@JsonController("/v1/roblox")
@UseBefore(RatelimitMiddleware)
export default class RobloxV1 {
  @Get("/info")
  @ResponseSchema(RobloxGroup)
  async getGroupInfo (@CurrentGroup() group: Group): Promise<RobloxGroup> {
    const userGroup = await Roblox.getGroup(group.robloxId);
    if (!userGroup) {
      throw new Error("Failed to get Roblox information");
    }
    return userGroup;
  }

  async getGroupsIcon (@CurrentGroup() group: Group): Promise<RobloxGroup> {
    const userGroup = await Roblox.getGroup(group.robloxId);
    if (!userGroup) {
      throw new Error("Failed to get Roblox information");
    }
    return userGroup;
  }

  @Patch("/shout")
  @ResponseSchema(SetShoutResponse)
  async postShout (@CurrentGroup() group: Group, @Body() { message }: SetShoutBody): Promise<SetShoutResponse> {
    const client = await Roblox.getClient(group.id);
    const newShout = await client.setShout(message);
    return {
      success: true,
      ...newShout
    };
  }

  @Delete("/exile/:uRbxId")
  @ResponseSchema(ExileUserResponse)
  async exileUser (@Params() { uRbxId }: UserRobloxIdParam, @CurrentGroup() group: Group): Promise<ExileUserResponse> {
    const isMember = await Roblox.isMember(group.robloxId, uRbxId);
    if (!isMember) {
      throw new BadRequestError("User is not a member of group");
    }

    const client = await Roblox.getClient(group.id);
    if (client.bot.dbBot.robloxId === uRbxId) {
      throw new BadRequestError("Cannot exile group bot account");
    }

    await client.exile(uRbxId);
    return {
      success: true,
      message: `Successfully kicked user ${uRbxId} from the group.`
    };
  }

  @Get("/rank/:uRbxId")
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
      throw new BadRequestError("User is not a member of group");
    }

    const client = await Roblox.getClient(group.id);

    await client.setRank(uRbxId, rank);
    await redis.del(redisPrefixes.userGroupsCache + uRbxId);

    return {
      success: true,
      message: "User's rank is updated"
    };
  }

  @Get("/permissions/:uRbxId")
  @ResponseSchema(GroupPermissions)
  async getPermissions (@Params() { uRbxId }: UserRobloxIdParam, @CurrentGroup() group: Group): Promise<GroupPermissions> {
    const client = await Roblox.getClient(group.id);
    const permissions = await client.getPermissions(uRbxId);

    if (!permissions) {
      return {
        name: "Guest",
        rank: 0,
        changeRank: false,
        acceptMembers: false,
        postShout: false,
        removeMembers: false,
        viewAudit: false,
        viewShout: false
      };
    }

    return permissions;
  }
}
