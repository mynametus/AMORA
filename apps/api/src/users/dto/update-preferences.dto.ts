import { IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredThemes?: string[];

  @IsOptional()
  @IsString()
  sweetnessLevel?: 'sweet' | 'serious' | 'playful';

  @IsOptional()
  @IsString()
  contentMaturity?: 'safe' | 'mature' | 'explicit';

  @IsOptional()
  @IsBoolean()
  checkIns?: boolean;

  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @IsOptional()
  @IsBoolean()
  updates?: boolean;
}

