import { fetch } from "..";
import { StartVerificationResponse } from "../types";

const startVerification = async (username: string, blurb: boolean = false): Promise<StartVerificationResponse> => {
  const response = await fetch(`${process.env.BACKEND_URL}/verification?blurb=${blurb}`, {
    method: "POST",
    body: { username }
  });

  return response.json();
};

export default startVerification;
