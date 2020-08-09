import { Type } from "class-transformer";
import {
  IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, Max, Min, ValidateNested
} from "class-validator";

export class UserRobloxIdParam {
  @IsNumber()
  @IsPositive()
  uRbxId: number;
}

export class RobloxRole {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(255)
  rank: number;
}

export class RobloxGroupOwner {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  id: number;
}

export class RobloxGroup {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  id: number;

  @IsUrl()
  emblemUrl: string;

  @ValidateNested()
  owner: RobloxGroupOwner;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => RobloxRole)
  roles: RobloxRole[];
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
export class ShoutPoster {
  @IsNumber()
  @IsPositive()
  userId: number

  @IsString()
  @IsNotEmpty()
  username: string
}
export class SetShoutResponse {
  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => ShoutPoster)
  poster: ShoutPoster

  @IsDateString()
  updated: string

  @IsBoolean()
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
  @IsNotEmpty()
  message: string;
}

export class ExileUserResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GroupPermissions {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  viewShout?: boolean;

  @IsBoolean()
  @IsOptional()
  postShout?: boolean;

  @IsBoolean()
  @IsOptional()
  viewAudit?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptMembers?: boolean;

  @IsBoolean()
  @IsOptional()
  removeMembers?: boolean;

  @IsBoolean()
  changeRank: boolean;
}
