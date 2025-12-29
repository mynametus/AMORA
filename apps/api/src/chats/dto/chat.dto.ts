import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateChatDto {
  @IsString()
  characterId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  scene?: {
    setting?: string;
    background?: string;
    characters?: string[];
    mood?: string;
    chapter?: number;
  };
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

