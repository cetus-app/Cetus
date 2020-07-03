import {
  IsNotEmpty, IsNumber, IsOptional, IsString
} from "class-validator";

// eslint-disable-next-line import/prefer-default-export
export class DiscordOAuth2CallbackQuery {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  state: string;

  @IsString()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  guild_id?: string;

  @IsNumber()
  @IsOptional()
  permissions: number;
}
