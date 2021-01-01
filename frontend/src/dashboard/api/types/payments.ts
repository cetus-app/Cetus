import { IntegrationType } from "./Integration";

export interface SessionBody {
  groupId: string;

  integrations: IntegrationType[];

  discountCode?: string;
}

export interface SessionResponse {
  sessionId: string;
}

export interface CustomerPortalSessionResponse {
  url: string;
}
