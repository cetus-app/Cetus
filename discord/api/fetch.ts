/* eslint-disable @typescript-eslint/naming-convention */
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

import { checkStatus } from ".";
import database from "../database";
import { GuildNotConfiguredError } from "../shared";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: {
    [key: string]: any;
  }
}

const baseFetch = (url: RequestInfo, options: RequestOptions = {}): Promise<Response> => {
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers,
    body
  }).then(checkStatus);
};

export default baseFetch;

export const authFetch = async (url: RequestInfo, guildId: string, options: RequestOptions = {}): Promise<Response> => {
  const guildConfig = await database.guilds.findOne(guildId);
  if (!guildConfig || !guildConfig.groupKey) throw new GuildNotConfiguredError(guildId, `Missing configuration/API key for guild ${guildId}`);

  const headers = { Authorization: `Bearer ${guildConfig.groupKey}` };

  return baseFetch(url, {
    headers,
    ...options
  });
};
