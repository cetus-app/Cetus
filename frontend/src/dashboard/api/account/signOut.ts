import { fetch } from "..";

export const signOut = async (all?: boolean): Promise<void> => {
  await fetch(`${process.env.BACKEND_URL}/account/logout`, {
    method: "POST",
    body: { all }
  });
};
export default signOut;
