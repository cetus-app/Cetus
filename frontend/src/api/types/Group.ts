import { PartialUser } from "./User";

export class PartialGroup {
  id: string;

  robloxId: number;

  created: Date;
}

export class UnlinkedGroup {
  name: string;

  id: number;

  emblemUrl: string;

  rank: number;

  role: string;
}
