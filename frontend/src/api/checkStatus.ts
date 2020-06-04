import { ApiError } from ".";

const checkStatus = async (response: Response): Promise<Response> => {
  if (response.ok) return response;
  throw new ApiError(response);
};

export default checkStatus;
