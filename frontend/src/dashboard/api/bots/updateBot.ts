import { fetch } from "..";
import { Bot, UpdateBotBody } from "../types/Bot";

const updateBot = async (id: string, body: UpdateBotBody): Promise<Bot> => fetch(`${process.env.BACKEND_URL}/bots/${id}`, {
  method: "PATCH",
  body
}).then(res => res.json());

export default updateBot;
