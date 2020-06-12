
import { fetch } from "../index";
import { ApiKey } from "../types";

export const deleteKey = async (id: ApiKey["id"]): Promise<undefined> => {
  await fetch(`${process.env.BACKEND_URL}/keys/${id}`, { method: "DELETE" });
  return undefined;
};
export default deleteKey;
