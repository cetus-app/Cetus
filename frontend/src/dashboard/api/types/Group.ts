
import { ApiKey } from "./ApiKey";
import { Bot } from "./Bot";
import { PartialIntegration } from "./Integration";
import {FullUser, PartialUser} from "./User";

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
  memberCount: number,
  publicEntryAllowed: boolean,
  isBuildersClubOnly: boolean
}

export class PartialGroup {
  id: string;

  robloxId: number;

  stripeSubscriptionId?: string;

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

  actionCount: number;

  actionLimit?: number;

  admins: FullUser[];
}
