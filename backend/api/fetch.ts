/* eslint-disable @typescript-eslint/naming-convention */
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

import checkStatus from "../shared/util/fetchCheckStatus";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: {
    [key: string]: any;
  }
}

const baseFetch = (url: RequestInfo, options: RequestOptions = {}): Promise<Response | undefined> => {
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
