import { checkStatus } from ".";
import { getCookie } from "../components/shared";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: {
    [key: string]: any;
  }
}
const baseFetch = (input: RequestInfo, options?: RequestOptions | undefined): Promise<Response> => {
  const body = options?.body ? JSON.stringify(options.body) : undefined;
  const csrfToken = getCookie("CSRF-Token");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "CSRF-Token": csrfToken,
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
