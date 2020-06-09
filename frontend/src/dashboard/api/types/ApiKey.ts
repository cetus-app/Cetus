
import { PartialGroup } from "./Group";

export class ApiKey {
  name: string;

  group?: PartialGroup;

  id: string;

  token: string;

  created: Date;
}
export default ApiKey;
