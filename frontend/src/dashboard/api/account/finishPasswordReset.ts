import { fetch } from "..";

const finishPasswordReset = async (token: string, newPassword: string): Promise<any> => fetch(`${process.env.BACKEND_URL}/account/finish-reset`, {
  method: "PATCH",
  body: {
    token,
    password: newPassword
  }

});
export default finishPasswordReset;
