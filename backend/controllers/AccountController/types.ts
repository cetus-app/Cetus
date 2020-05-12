import { Type } from "class-transformer";
import {
  IS_UUID, IsBoolean, IsDate,
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength
} from "class-validator";
import exp from "constants";

export class UserAccessBody {
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string
}

export class PartialUser {
  @IsEmail()
  email: string;

  @IsUUID("4")
  id: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  rId?: number;

  @IsDate()
  created: Date
}

export class FullUser extends PartialUser {


}
