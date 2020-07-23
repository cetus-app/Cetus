
import { ApiKey } from "./ApiKey";
import { Bot } from "./Bot";
import { PartialIntegration } from "./Integration";
import { PartialUser } from "./User";

interface GroupBase {
  name: string,
  id: number,
  emblemUrl: string,
}
interface RobloxRole {
  name: string,
  rank: number
}

export interface RobloxGroup extends GroupBase{
  owner: {
    name: string,
    id: number
  },
  description: string,
  roles: RobloxRole[]
}

export enum Subscription {
  basic = "BASIC"
}

export class PartialGroup {
  id: string;

  robloxId: number;

  subscription?: Subscription;

  botActive: boolean;

  created: Date;

  robloxInfo: RobloxGroup;
}

export class UnlinkedGroup {
  name: string;

  id: number;

  emblemUrl: string;

  rank: number;

  role: string;
}

export class FullGroup extends PartialGroup {
  // Make this a DTO too?
  keys: ApiKey[];

  integrations: PartialIntegration[];

  owner: PartialUser;

  bot?: Bot
}
