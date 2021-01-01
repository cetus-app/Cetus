import { fetch } from "..";
import { GroupIdParam } from "../../../../../backend/controllers/IntegrationController/types";
import { CustomerPortalSessionResponse } from "../types";

const createPortalSession = async (body: GroupIdParam): Promise<CustomerPortalSessionResponse> => fetch(`${process.env.BACKEND_URL}/payments/customer-portal`, {
  method: "POST",
  body
}).then(res => res.json());

export default createPortalSession;
