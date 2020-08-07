import { fetch } from "..";
import { Bot } from "../types/Bot";

export const markBotActive = async (groupId: string): Promise<Bot> => {
  const response = await fetch(`${process.env.BACKEND_URL}/groups/${groupId}/bot`, { method: "PATCH" });
  return response.json();
};
export default markBotActive;
