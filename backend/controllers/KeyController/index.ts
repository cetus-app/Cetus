import { Request } from "express";
import {
  Body,
  CurrentUser,
  Delete,
  JsonController, NotFoundError,
  OnUndefined,
  Params, Post, Req, UseBefore
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";


import database from "../../database";
import { User } from "../../entities";
import ApiKey from "../../entities/ApiKey.entity";
import Group from "../../entities/Group.entity";
import { csrfMiddleware } from "../../middleware/CSRF";
import generateToken from "../../shared/util/generateToken";
import { ApiKeyRequest, ApiKeyResponse, DeleteKeyRequest } from "./types";


@JsonController("/keys")
@UseBefore(csrfMiddleware)
export default class KeyController {
  @OpenAPI({ description: "Adds a new API key for a given group" })
  @Post("/")
  @ResponseSchema(ApiKeyResponse)
  async addKey (@CurrentUser({ required: true }) _user: User,
                @Body() { name, groupId }: ApiKeyRequest,
                @Req() request: Request): Promise<ApiKeyResponse> {
    // Check they own it/have access
    // Throws an error if no access
    const grp = await request.groupService.canAccessGroup(groupId);

    const newKey = new ApiKey();
    newKey.name = name;
    newKey.token = await generateToken();
    newKey.group = grp;
    await database.keys.save(newKey);

    delete newKey.group;

    return newKey;
  }

  @OpenAPI({ description: "Delete an API token" })
  @Delete("/:id")
  @OnUndefined(204)
  async removeKey (@CurrentUser({ required: true }) user: User,
                   @Params({
                     required: true,
                     validate: true
                   }) { id }: DeleteKeyRequest): Promise<void> {
    const key = await database.keys.findOne(id, { relations: ["group", "group.owner"] });

    if (!key) throw new NotFoundError();

    // Don't expose a valid ID
    if (key.group.owner.id !== user.id) throw new NotFoundError();

    await database.keys.remove(key);
  }
}
