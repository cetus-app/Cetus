import { Response } from "node-fetch";

import { ExternalHttpError } from "../errors";

const checkStatus = (response: Response): Response|undefined => {
  if (response.ok) return response;
  if (response.status === 404) {
    return undefined;
  }

  throw new ExternalHttpError(response);
};

export default checkStatus;
