
import { fetch } from "../index";
import { FullGroup } from "../types";

export const getGroup = async (id: FullGroup["id"]): Promise<FullGroup> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups/${id}`);
  return response.json();
};
export default getGroup;
