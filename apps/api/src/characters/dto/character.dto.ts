import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PersonalityTraitsDto {
  @IsOptional()
  warmth?: number;

  @IsOptional()
  playfulness?: number;

  @IsOptional()
  seriousness?: number;

  @IsOptional()
  emotionalDepth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  traits?: string[];
}

class VoiceSettingsDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  speed?: number;

  @IsOptional()
  pitch?: number;

  @IsOptional()
  @IsString()
  style?: string;
}

class CharacterBoundariesDto {
  @IsOptional()
  @IsString()
  maxRomanceLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedTopics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedTopics?: string[];

  @IsOptional()
  @IsBoolean()
  safeMode?: boolean;
}

export class CreateCharacterDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  avatar: string;

  @IsString()
  archetype: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalityTraitsDto)
  personality?: PersonalityTraitsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VoiceSettingsDto)
  voice?: VoiceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CharacterBoundariesDto)
  boundaries?: CharacterBoundariesDto;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  archetype?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalityTraitsDto)
  personality?: PersonalityTraitsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VoiceSettingsDto)
  voice?: VoiceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CharacterBoundariesDto)
  boundaries?: CharacterBoundariesDto;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

