import { fetch } from "..";
import { Bot } from "../types/Bot";

const bots = async (): Promise<Bot[]> => fetch(`${process.env.BACKEND_URL}/bots`).then(res => res.json());

export default bots;
