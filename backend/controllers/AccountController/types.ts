import {
  IsAscii, IsBoolean, IsDate,
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, IsUUID, MaxLength, MinLength, ValidateIf
} from "class-validator";

// TODO: Combine common fields?
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
// TODO: Move password to custom decorator?
export class ChangePasswordBody {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string

  @IsString()
  @IsOptional()
  @ValidateIf(body => body.currentPassword !== "")
  @MinLength(5)
  currentPassword?: string
}
export class ForgotPasswordBody {
  @IsEmail()
  @MaxLength(50)
  email: string
}

export class FinishPasswordBody {
  @IsString()
  @MinLength(50)
  @MaxLength(50)
  token: string

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string
}

export class ChangeEmailBody {
  @IsEmail()
  @MaxLength(50)
  email: string;
}

export class DeleteAccountBody {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsOptional()
  password?: string
}

export class SignOutBody {
  @IsBoolean()
  @IsOptional()
  all?: boolean
}

export class FullUser extends PartialUser {


}
