import { Response as FetchResponse } from "node-fetch";

// eslint-disable-next-line import/prefer-default-export
export class ExternalHttpError extends Error {
  constructor (response: FetchResponse, ...params: ConstructorParameters<typeof Error>) {
    super(...params);

    Error.captureStackTrace(this, ExternalHttpError);

    this.name = "ExternalHttpError";
    this.response = response;
  }

  response: FetchResponse;
}
