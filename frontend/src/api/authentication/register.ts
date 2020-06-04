import { fetch } from "..";
import { PartialUser } from "../types";

export const register = async (email: string, password: string): Promise<PartialUser> => {
  const response = await fetch(`${process.env.BACKEND_URL}/account`, {
    method: "POST",
    body: {
      email,
      password
    }
  });
  return response.json();
};
export default register;
