import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Chat, Message, PaginatedResponse } from '@amora/types';
import { CreateChatDto, SendMessageDto } from './dto/chat.dto';
import { AiService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';
import { ContentModerationService } from '../content-moderation/content-moderation.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly memoryService: MemoryService,
    private readonly moderationService: ContentModerationService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async findAll(userId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Chat>> {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.chat.count({ where: { userId } }),
    ]);

    return {
      items: items as Chat[],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total,
    };
  }

  async findById(userId: string, id: string): Promise<Chat> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        character: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100, // Limit to last 100 messages
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return chat as Chat;
  }

  async create(userId: string, dto: CreateChatDto): Promise<Chat> {
    // Verify character exists and user has access
    const character = await this.prisma.character.findUnique({
      where: { id: dto.characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    // Check premium access if needed
    if (character.isPremium) {
      const hasAccess = await this.subscriptionService.hasPremiumAccess(userId);
      if (!hasAccess) {
        throw new ForbiddenException('Premium subscription required');
      }
    }

    const chat = await this.prisma.chat.create({
      data: {
        userId,
        characterId: dto.characterId,
        title: dto.title,
        scene: dto.scene,
      },
      include: {
        character: true,
      },
    });

    return chat as Chat;
  }

  async sendMessage(userId: string, chatId: string, dto: SendMessageDto): Promise<Message> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { character: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check rate limits
    const canSend = await this.subscriptionService.checkMessageLimit(userId);
    if (!canSend) {
      throw new ForbiddenException('Message limit reached. Please upgrade to premium.');
    }

    // Content moderation
    const moderationResult = await this.moderationService.moderate(dto.content);
    if (!moderationResult.isSafe) {
      throw new ForbiddenException('Message contains inappropriate content');
    }

    // Save user message
    const userMessage = await this.prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });

    // Update chat last message time
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    // Get AI response (this will be handled via WebSocket for streaming)
    // For now, we'll return the user message
    return userMessage as Message;
  }

  async getAiResponse(userId: string, chatId: string): Promise<string> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        character: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!chat || chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Get relevant memories
    const memories = await this.memoryService.getRelevantMemories(userId, chat.characterId);

    // Generate AI response
    const response = await this.aiService.generateResponse({
      character: chat.character,
      messages: chat.messages,
      memories,
      scene: chat.scene,
    });

    // Save AI message
    const aiMessage = await this.prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        content: response.content,
        metadata: response.metadata,
      },
    });

    // Update memories based on conversation
    await this.memoryService.processConversation(userId, chat.characterId, chatId, [
      ...chat.messages,
      aiMessage,
    ]);

    return response.content;
  }

  async delete(userId: string, id: string): Promise<void> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.chat.delete({
      where: { id },
    });
  }
}

