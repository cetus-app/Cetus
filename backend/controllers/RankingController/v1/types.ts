import {
  IsBoolean, IsNumber, IsPositive, IsString, Max, Min
} from "class-validator";

export class UserRobloxIdParam {
  @IsNumber()
  @IsPositive()
  uRbxId: number;
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
