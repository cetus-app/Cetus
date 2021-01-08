import { fetch } from "..";
import { FullGroup } from "../types";

export const removeAdmin = async (groupId: string, userId: string): Promise<FullGroup> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups/${groupId}/admins`, {
    method: "DELETE",
    body: { userId }
  });
  return response.json();
};
export default removeAdmin;
