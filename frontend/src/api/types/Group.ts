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


export class PartialGroup {
  id: string;

  robloxId: number;

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
