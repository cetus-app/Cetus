import { Type } from "class-transformer";
import {
  IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min
} from "class-validator";

export class UserRobloxIdParam {
  @IsNumber()
  @IsPositive()
  uRbxId: number;
}

// {
//   "body": "string",
//   "poster": {
//     "buildersClubMembershipType": "None",
//     "userId": 0,
//     "username": "string",
//     "displayName": "string"
//   },
//   "created": "2020-08-01T18:12:25.700Z",
//   "updated": "2020-08-01T18:12:25.700Z"
// }
export class SetShoutBody {
  @IsString()
  message: string;
}
class ShoutPoster {
  @IsNumber()
  userId: number

  @IsString()
  username: string
}
export class SetShoutResponse {
  @IsString()
  message: string;

  @Type(() => ShoutPoster)
  poster: ShoutPoster

  updated: string

  success: boolean
}

export class GetRankResponse {
  @IsNumber()
  @IsPositive()
  rank: number;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class SetRankBody {
  @IsNumber()
  @Min(0)
  @Max(255)
  rank: number;
}

export class SetRankResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}

export class ExileUserResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}
