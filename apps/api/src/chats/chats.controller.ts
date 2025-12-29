import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChatDto, SendMessageDto } from './dto/chat.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async findAll(@Req() req, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.chatsService.findAll(
      req.user.id,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20
    );
  }

  @Get(':id')
  async findById(@Req() req, @Param('id') id: string) {
    return this.chatsService.findById(req.user.id, id);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateChatDto) {
    return this.chatsService.create(req.user.id, dto);
  }

  @Post(':id/messages')
  async sendMessage(@Req() req, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.chatsService.sendMessage(req.user.id, id, dto);
  }

  @Post(':id/response')
  async getAiResponse(@Req() req, @Param('id') id: string) {
    const content = await this.chatsService.getAiResponse(req.user.id, id);
    return { content };
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    await this.chatsService.delete(req.user.id, id);
    return { success: true };
  }
}

