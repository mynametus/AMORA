import { Module } from '@nestjs/common';
import { ContentModerationService } from './content-moderation.service';
import { MODERATION_KEYWORDS } from '@amora/config';

@Module({
  providers: [ContentModerationService],
  exports: [ContentModerationService],
})
export class ContentModerationModule {}

