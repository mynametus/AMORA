import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('memory')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get('summary/:characterId?')
  async getSummary(@Req() req, @Param('characterId') characterId?: string) {
    return this.memoryService.getMemorySummary(req.user.id, characterId);
  }

  @Get('relevant/:characterId?')
  async getRelevant(@Req() req, @Param('characterId') characterId?: string) {
    return this.memoryService.getRelevantMemories(req.user.id, characterId);
  }

  @Delete(':id')
  async deleteMemory(@Req() req, @Param('id') id: string) {
    await this.memoryService.deleteMemory(req.user.id, id);
    return { success: true };
  }
}

