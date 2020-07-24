import {
  IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min
} from "class-validator";

export class UserRobloxIdParam {
  @IsNumber()
  @IsPositive()
  uRbxId: number;
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
