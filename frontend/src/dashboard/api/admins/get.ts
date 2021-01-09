import { fetch } from "..";
import { AdminInfo } from "../types";

/**
 * Returns the Cetus ID and roblox information of a user, so that they can be added as an admin.
 * Group admins are fetched by fetching a FullGroup - Not via. This function.
 * @param idOrUsername - The roblox id or roblox username they want to add.
 */
export const getAdmin = async (idOrUsername: string): Promise<AdminInfo> => fetch(`${process.env.BACKEND_URL}/groups/admins/${idOrUsername}`)
  .then(res => res.json());

export default getAdmin;
