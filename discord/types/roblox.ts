// Roblox have different conventions than us
/* eslint-disable @typescript-eslint/naming-convention */

export interface RobloxRole {
  name: string,
  rank: number
}
// Like above but before it's converted
export interface RobloxInputRole {
  Name: string,
  Rank: number
}
interface GroupBase {
  name: string,
  id: number,
  emblemUrl: string,
}

export interface RobloxGroupIcon {
  id: number,
  url: string
}

// Returned by /users/{userId}/groups
export interface UserRobloxGroup extends GroupBase{
  rank: number,
  role: string
}

// /groups/{groupId}
export interface RobloxGroup extends GroupBase{
  owner: {
    name: string,
    id: number
  },
  description: string,
  roles: RobloxRole[]
}

export interface RobloxUser{
  description: string,
  created: Date,
  isBanned: boolean,
  id: number,
  name: string,
  displayName:string
}

export interface FullRobloxRole {
  id: number;
  name: string;
  description: string;
  rank: number;
  memberCount: number;
}
// The roblox type has "message" as "body" but that makes no sense since we provide it as message
export interface Shout {
  message: string;
  poster: {
    userId: number,
    username: string
  },
  updated: string
}

export interface GroupPermissions {
  name: string,
  rank: number,
  viewShout?: boolean,
  postShout?: boolean,
  viewAudit?: boolean,
  acceptMembers?: boolean,
  removeMembers?: boolean,
  changeRank: boolean
}
