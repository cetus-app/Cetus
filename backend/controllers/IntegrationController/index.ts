import { User } from "@sentry/node";
import { Request } from "express";
import {
  Authorized, BadRequestError, Body, CurrentUser, Delete, Get, JsonController, NotFoundError, OnUndefined, Params, Patch, Post, Req
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import database from "../../database";
import CurrentGroup from "../../decorators/CurrentGroup";
import { Group, Integration } from "../../entities";
import {
  AntiAdminAbuseConfig, BaseIntegrationConfig, defaultAntiAdminAbuseConfig, defaultDiscordConfig, DiscordBotConfig, IntegrationType
} from "../../entities/Integration.entity";
import {
  AddIntegrationBody, GroupIdParam, IdParam, integrationMeta, IntegrationTypeParam, PartialIntegration, UpdateIntegrationBody
} from "./types";


@JsonController("/integrations")
export default class Integrations {
  @Get("/global/meta")
  @Authorized()
  getMetas (): typeof integrationMeta {
    return integrationMeta;
  }

  @Get("/:groupId")
  @ResponseSchema(PartialIntegration)
  @Authorized()
  async getEnabled (@Params() { groupId }: GroupIdParam, @Req() { groupService }: Request): Promise<PartialIntegration[]> {
    const group = await groupService.canAccessGroup(groupId);
    return group.integrations;
  }

  // For integrations to fetch their own configuration
  @Get("/type/:type")
  @OpenAPI({ description: "Used by integrations to fetch their own configuration" })
  @ResponseSchema(PartialIntegration)
  async getType (@Params() { type }: IntegrationTypeParam, @CurrentGroup() group: Group): Promise<PartialIntegration | undefined> {
    return database.integrations.findOne({
      type,
      group: { id: group.id }
    });
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

    let config: BaseIntegrationConfig | DiscordBotConfig | AntiAdminAbuseConfig;

    switch (type) {
      case IntegrationType.discordBot:
        config = defaultDiscordConfig;
        break;

      case IntegrationType.antiAdminAbuse:
        config = defaultAntiAdminAbuseConfig;
        break;

      default:
        config = {};
        break;
    }

    integration.config = config;
    await database.integrations.save(integration);

    // Remove group from response
    delete integration.group;

    return integration;
  }

  @Patch("/type/:type")
  @OpenAPI({ description: "Used by integrations to update their own configuration" })
  @ResponseSchema(PartialIntegration)
  async updateType (
    @Params() { type }: IntegrationTypeParam,
    @Body() { config }: UpdateIntegrationBody,
    @CurrentGroup() group: Group
  ): Promise<PartialIntegration> {
    const integration = await database.integrations.findOne({
      type,
      group: { id: group.id }
    });

    if (!integration) throw new NotFoundError();

    return database.integrations.save({
      id: integration.id,
      config: {
        ...integration.config,
        ...config
      }
    });
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
