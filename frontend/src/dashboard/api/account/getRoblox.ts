import { fetch } from "..";
import { RobloxUser } from "../types";

export const getRoblox = async (): Promise<RobloxUser> => {
  const response = await fetch(`${process.env.BACKEND_URL}/account/roblox`);
  return response.json();
};
export default getRoblox;
