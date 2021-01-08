import { fetch } from "..";
import { FullGroup } from "../types";

export const addAdmin = async (groupId: string, userId: string): Promise<FullGroup> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups/${groupId}/admins`, {
    method: "POST",
    body: { userId }
  });
  return response.json();
};
export default addAdmin;
