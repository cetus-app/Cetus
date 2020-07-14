import { fetch } from "../index";
import { PartialIntegration } from "../types";

const updateIntegration = async (integrationId:string, integrationConfig:PartialIntegration["config"]): Promise<PartialIntegration> => {
  const response = await fetch(`${process.env.BACKEND_URL}/integrations/${integrationId}`, {
    method: "PATCH",
    body: { config: integrationConfig }
  });
  return response.json();
};
export default updateIntegration;
