export interface PartialUser {
  email: string;

  id: string;

  emailVerified?: boolean;

  rId?: number;

  created: Date
}

export interface FullUser extends PartialUser {}
