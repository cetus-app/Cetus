export interface PartialUser {
  email: string;

  id: string;

  emailVerified?: boolean;

  robloxId?: number;

  discordId?: string;

  // it isn't a date when returned
  created: string
}

export interface FullUser extends PartialUser {}

export interface RobloxUser {
  id: number


  username: string


  image: string
}
