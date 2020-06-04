import { Request } from "express";
import {
  Body,
  CurrentUser,
  Delete,
  JsonController, OnUndefined,
  Params,
  Post, Req
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
// TODO:
//  Move canAccessGroup to group service
//  Finish off the stuff here & add group ownership validation
//  OR: Move getGroup to group repository?
//  Move to a branch

import database from "../../database";
import { Group, User } from "../../entities";
import ApiKey from "../../entities/ApiKey.entity";
import generateToken from "../../shared/util/generateToken";
import { ApiKeyRequest, ApiKeyResponse, DeleteKeyRequest } from "./types";


@JsonController("/keys")
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

    // await database.groups.createQueryBuilder()
    //   .relation(Group, "keys")
    //   .of(grp.id)
    //   .add(newKey).catch(console.error);
    delete newKey.group;

    return newKey;
  }

  @OpenAPI({ description: "Delete an API token" })
  @Delete("/:id")
  @OnUndefined(204)
  async removeKey (@CurrentUser({ required: true }) _user: User,
                   @Params({
                     required: true,
                     validate: true
                   }) { id }: DeleteKeyRequest,
                   @Req() request: Request): Promise<void> {
    const grp = await request.groupService.canAccessGroup(id);

    await database.groups.createQueryBuilder()
      .relation(Group, "keys")
      .of(grp.id)
      .remove(id);
  }
}
