interface RobloxRole {
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

// Returned by /users/{userId}/groups
export interface UserRobloxGroup extends GroupBase{
  rank: number,
  role: string,
  isInClan: boolean, // we dont care
  isPrimary: boolean
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
