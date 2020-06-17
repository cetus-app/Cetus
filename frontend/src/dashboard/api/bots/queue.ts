import { fetch } from "..";
import { QueueItem } from "../types/Bot";

const queue = async (): Promise<QueueItem[]> => fetch(`${process.env.BACKEND_URL}/bots/queue`).then(res => res.json());

export default queue;
