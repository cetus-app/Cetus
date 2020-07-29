import { fetch } from "..";

const startPasswordReset = async (email: string): Promise<any> => fetch(`${process.env.BACKEND_URL}/account/reset`, {
  method: "PATCH",
  body: { email }

});
export default startPasswordReset;
