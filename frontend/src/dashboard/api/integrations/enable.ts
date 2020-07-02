import { fetch } from "../index";
import { PartialIntegration } from "../types";

export const enableIntegration = async (groupId:string, integrationType:string): Promise<PartialIntegration> => {
  const response = await fetch(`${process.env.BACKEND_URL}/integrations/${groupId}`, {
    method: "POST",
    body: { type: integrationType }
  });
  return response.json();
};
export default enableIntegration;
