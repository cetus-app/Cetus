import { fetch } from "..";
import { AddBotBody, Bot } from "../types/Bot";

const addBot = async (body: AddBotBody): Promise<Bot> => fetch(`${process.env.BACKEND_URL}/bots`, {
  method: "POST",
  body
}).then(res => res.json());

export default addBot;
