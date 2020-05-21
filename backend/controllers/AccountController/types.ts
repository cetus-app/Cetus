import {
  IsAscii, IsBoolean, IsDate,
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength
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
  rId?: number;

  @IsDate()
  created: Date
}

export class FullUser extends PartialUser {


}
