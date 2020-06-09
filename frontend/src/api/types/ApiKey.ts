
import { PartialGroup } from "./Group";

export default class ApiKey {
  name: string;

  group?: PartialGroup;

  id: string;

  token: string;

  created: Date;
}
