import { Request } from "express";
import {
  Get,
  JsonController,
  NotFoundError, UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";


import database from "../../database";
import Integration, { IntegrationType } from "../../entities/Integration.entity";
import { InternalGroup } from "./types";
import safeCompare from "../../shared/util/safeCompare";

export function internalAuth (request: Request, _response: any, next?: (err?: any) => any): any {
  const token = request.get("authorization");
  // TODO: Move to safe compare
  // Why bother?
  // These internal endpoints expose *extremely* sensitive information (Bot keys) in unencrypted form.
  // They MUST be secure as possible.
  if (!process.env.internalKey || !token || !safeCompare(token, process.env.internalKey)) {
    throw new NotFoundError("Resource not found.");
  }
  return next ? next() : "";
}

@UseBefore(internalAuth)
@JsonController("/internal")
export default class Internal {
  // Group defender
  @Get("/scannable")
  @ResponseSchema(InternalGroup, { isArray: true })
  async getScannable (): Promise<Integration[]> {
    // Based on https://kscerbiakas.lt/typeorm-nested-relationships/
    return database.integrations.createQueryBuilder("integration")
      .leftJoinAndSelect("integration.group", "group")
      .leftJoinAndSelect("group.bot", "bot")
      .addSelect("bot.cookie")
      .where("integration.type = :type", { type: IntegrationType.antiAdminAbuse })
      .andWhere("bot.dead = :no", { no: false })
      .getMany();
  }
}
