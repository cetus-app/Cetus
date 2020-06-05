import { User } from "@sentry/node";
import { Request } from "express";
import {
  Authorized, BadRequestError, Body, CurrentUser, Delete, Get, JsonController, NotFoundError, OnUndefined, Params, Post, Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import database from "../../database";
import { Integration } from "../../entities";
import {
  AddIntegrationBody, GroupIdParam, IdParam, PartialIntegration
} from "./types";

@JsonController("/integrations")
export default class Integrations {
  @Get("/:groupId")
  @ResponseSchema(PartialIntegration)
  @Authorized()
  async getEnabled (@Params() { groupId }: GroupIdParam, @Req() { groupService }: Request): Promise<PartialIntegration[]> {
    const group = await groupService.canAccessGroup(groupId);

    return group.integrations;
  }

  @Post("/:groupId")
  @ResponseSchema(PartialIntegration)
  @Authorized()
  async addIntegration (
    @Params() { groupId }: GroupIdParam,
    @Body() { type }: AddIntegrationBody,
    @Req() { groupService }: Request
  ): Promise<PartialIntegration> {
    const group = await groupService.canAccessGroup(groupId);

    if (group.integrations.some(int => int.type === type)) throw new BadRequestError("Integration already enabled");

    const integration = new Integration();
    integration.type = type;
    integration.group = group;
    await database.integrations.save(integration);

    // Remove group from response
    delete integration.group;

    return integration;
  }

  @Delete("/:id")
  @OnUndefined(204)
  async removeIntegration (@CurrentUser({ required: true }) user: User, @Params() { id }: IdParam): Promise<void> {
    const integration = await database.integrations.findOne(id, { relations: ["group", "group.owner"] });
    if (!integration) throw new NotFoundError();

    // "Mask" no access as not found (doesn't expose IDs)
    if (integration.group.owner.id !== user.id) throw new NotFoundError();

    await database.integrations.remove(integration);
  }
}
