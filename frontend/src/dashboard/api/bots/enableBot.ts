import { fetch } from "..";
import { EnableBotResponse } from "../types/Bot";

const enableBot = async (groupId: string): Promise<EnableBotResponse> => fetch(`${process.env.BACKEND_URL}/groups/${groupId}/bot`, { method: "PATCH" }).then(res => res.json());

export default enableBot;
