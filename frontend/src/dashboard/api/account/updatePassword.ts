import { fetch } from "..";
// Reset meaning via. Email
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<any> => fetch(`${process.env.BACKEND_URL}/account/password`, {
  method: "PATCH",
  body: {
    currentPassword,
    password: newPassword
  }

});
export default updatePassword;
