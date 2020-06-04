import { fetch } from "..";
import { PartialUser } from "../types";

export const login = async (email: string, password: string): Promise<PartialUser> => {
  const response = await fetch(`${process.env.BACKEND_URL}/account/login`, {
    method: "POST",
    body: {
      email,
      password
    }
  });
  return response.json();
};
export default login;
