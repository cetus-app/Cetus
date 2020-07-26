import {
  IsAscii, IsBoolean, IsDate,
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, IsUUID, MaxLength, MinLength
} from "class-validator";

export class UserAccessBody {
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string
}

export class VerificationCode {
  @IsString()
  @MinLength(50)
  @MaxLength(50)
  @IsAscii()
  code: string
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
  robloxId?: number;

  @IsDate()
  created: Date
}
// We never return the whole thing because the client doesn't need it.
export class PartialRobloxUser {
  @IsNumber()
  @IsPositive()
  id: number

  @IsString()
  username: string

  @IsUrl()
  image: string
}

export class FullUser extends PartialUser {


}
