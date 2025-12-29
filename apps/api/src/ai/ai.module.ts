import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAIService } from './openai.service';

@Module({
  providers: [AiService, OpenAIService],
  exports: [AiService, OpenAIService],
})
export class AiModule {}

