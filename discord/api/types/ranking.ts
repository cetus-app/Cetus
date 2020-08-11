export interface UserMembership {
  rank: number;
  role: string;
}

export interface SetRankResponse {
  success: boolean;
  message: string;
}
