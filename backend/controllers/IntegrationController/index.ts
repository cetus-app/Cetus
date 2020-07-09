import { User } from "@sentry/node";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";
import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  Get, InternalServerError,
  JsonController,
  NotFoundError,
  OnUndefined,
  Params,
  Patch,
  Post,
  Req
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

import database from "../../database";
import { Integration } from "../../entities";
import { CustomValidationError } from "../../shared";
import {
  AddIntegrationBody,
  EditIntegrationBody,
  GroupIdParam,
  IdParam, integrationConfig, integrationDefault,
  integrationMeta,
  PartialIntegration
} from "./types";


@JsonController("/integrations")
export default class Integrations {
  @Get("/global/meta")
  @Authorized()
  getMetas (): typeof integrationMeta {
    return integrationMeta;
  }

  @Get("/:groupId")
  @ResponseSchema(PartialIntegration, { isArray: true })
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
    if (integrationDefault[type]) {
      integration.config = integrationDefault[type];
    }
    await database.integrations.save(integration);

    // Remove group from response
    delete integration.group;

    return integration;
  }

  @Patch("/:id")
  @ResponseSchema(PartialIntegration)
  @Authorized()
  async editIntegration (
      @Params() { id }: IdParam,
      @Body() { config }: EditIntegrationBody,
      @Req() request: Request
  ): Promise<PartialIntegration> {
    // We query via. Group because we've got to change ownership anyway
    const integration = await database.integrations.findOne({ id }, { relations: ["group", "group.owner"] });
    if (!integration) {
      throw new BadRequestError("Integration does not exist.");
    }
    await request.groupService.canAccessGroup(integration.group);
    // Validation
    if (integrationConfig[integration.type]) {
      const c = integrationConfig[integration.type];
      // @ts-ignore
      const configClass = plainToClass<any, any>(c, config);
      const errors = await validate(configClass, { forbidUnknownValues: true });
      if (errors.length !== 0) {
        throw new CustomValidationError(errors);
      }
      const keys = Object.keys(configClass);
      const current = integration.config;
      for (const key of keys) {
        // @ts-ignore
        current[key] = configClass[key];
      }
      integration.config = current;
    } else {
      throw new InternalServerError("No available validator for integration type");
    }
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
