import { checkStatus } from ".";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: {
    [key: string]: any;
  }
}

const baseFetch = (input: RequestInfo, options?: RequestOptions | undefined): Promise<Response> => {
  const body = options?.body ? JSON.stringify(options.body) : undefined;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options?.headers
  };

  return fetch(input, {
    credentials: "include",
    headers,
    ...options,
    body
  }).then(checkStatus);
};

export default baseFetch;
