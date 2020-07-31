import { fetch } from "..";

export const deleteGroup = async (id: string): Promise<void> => {
  await fetch(`${process.env.BACKEND_URL}/groups/${id}`, { method: "DELETE" });
};

export default deleteGroup;
