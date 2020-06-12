
import { fetch } from "../index";
import { ApiKey, FullGroup } from "../types";

export const addKey = async (id: FullGroup["id"], name: string): Promise<ApiKey> => {
  const response = await fetch(`${process.env.BACKEND_URL}/keys`, {
    method: "POST",
    body: {
      groupId: id,
      name
    }
  });
  return response.json();
};
export default addKey;
