import { ApiError } from ".";

const checkStatus = (response: Response): Response => {
  if (response.ok) return response;

  throw new ApiError(response);
};

export default checkStatus;
