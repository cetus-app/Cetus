import { fetch } from "..";
import { PartialGroup } from "../types";

export const addGroup = async (robloxId: number): Promise<PartialGroup> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups`, {
    method: "POST",
    body: { robloxId }
  });
  return response.json();
};
export default addGroup;
