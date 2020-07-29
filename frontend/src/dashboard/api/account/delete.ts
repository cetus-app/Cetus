import { fetch } from "..";
import { RobloxUser } from "../types";
// :(
export const deleteAccount = async (password: string): Promise<RobloxUser> => {
  const response = await fetch(`${process.env.BACKEND_URL}/account`, {
    method: "DELETE",
    body: { password }
  });
  return response.json();
};
export default deleteAccount;
