import { fetch } from "..";
import { SessionBody, SessionResponse } from "../types";

const createSession = async (body: SessionBody): Promise<SessionResponse> => fetch(`${process.env.BACKEND_URL}/payments/session`, {
  method: "POST",
  body
}).then(res => res.json());

export default createSession;
