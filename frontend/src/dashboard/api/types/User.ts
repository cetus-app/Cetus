export interface PartialUser {
  email: string;

  id: string;

  emailVerified?: boolean;

  robloxId?: number;

  discordId?: string;

  created: Date
}

export interface FullUser extends PartialUser {}

export interface RobloxUser {
  id: number


  username: string


  image: string
}
