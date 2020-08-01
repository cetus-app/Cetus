import { fetch } from "..";
// :(
export const deleteAccount = async (password: string): Promise<void> => {
  await fetch(`${process.env.BACKEND_URL}/account`, {
    method: "DELETE",
    body: { password }
  });
};
export default deleteAccount;
