import { IntegrationType } from "./Integration";

export interface SessionBody {
  groupId: string;

  integrations: IntegrationType[];
}

export interface SessionResponse {
  sessionId: string;
}
