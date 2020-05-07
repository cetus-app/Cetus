import { Response } from "node-fetch";

import { ExternalHttpError } from "../errors";

const checkStatus = (response: Response) => {
  if (response.ok) return response;

  throw new ExternalHttpError(response.url);
};

export default checkStatus;
