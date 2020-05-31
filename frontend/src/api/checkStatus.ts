import { ApiError } from ".";

const checkStatus = (response: Response): Response => {
  if (response.ok || response.status === 401) return response;
  throw new ApiError(response);
};

export default checkStatus;
