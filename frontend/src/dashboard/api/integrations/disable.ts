import { fetch } from "../index";

export const disableIntegration = async (id: string): Promise<void> => {
  await fetch(`${process.env.BACKEND_URL}/integrations/${id}`, { method: "DELETE" });
};
export default disableIntegration;
