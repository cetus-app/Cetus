export interface PartialUser {
  email: string;

  id: string;

  emailVerified?: boolean;

  robloxId?: number;

  created: Date
}

export interface FullUser extends PartialUser {}
