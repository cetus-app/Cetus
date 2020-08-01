import { fetch } from "..";

export const updateEmail = async (email: string): Promise<any> => fetch(`${process.env.BACKEND_URL}/account/email`, {
  method: "PATCH",
  body: { email }

});
export default updateEmail;
