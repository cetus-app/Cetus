export interface SetShoutBody {
  message: string;
}

export interface ShoutPoster {
  userId: number;
  username: string;
}

export interface SetShoutResponse {
  message: string;
  poster: ShoutPoster;
  updated: string;
  success: boolean;
}
