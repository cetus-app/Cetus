import { fetch } from "..";
import { VerifyResponse } from "../types";

const verifyBlurb = async (rId: number): Promise<VerifyResponse> => {
  const response = await fetch(`${process.env.BACKEND_URL}/verification/blurb/${rId}`, { method: "POST" });

  return response.json();
};

export default verifyBlurb;
