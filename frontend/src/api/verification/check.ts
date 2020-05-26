import { fetch } from "..";
import { VerifyResponse } from "../types";

const check = async (rId: number): Promise<VerifyResponse> => {
  const response = await fetch(`${process.env.BACKEND_URL}/verification/check/${rId}`, { method: "POST" });

  return response.json();
};

export default check;
