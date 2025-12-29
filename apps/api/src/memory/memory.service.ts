import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Memory, MemorySummary } from '@amora/types';
import { OpenAIService } from '../ai/openai.service';

@Injectable()
export class MemoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenAIService
  ) {}

  async getRelevantMemories(userId: string, characterId?: string, limit: number = 10): Promise<Memory[]> {
    const where: any = { userId };
    if (characterId) {
      where.characterId = characterId;
    }

    const memories = await this.prisma.memory.findMany({
      where,
      orderBy: [
        { importance: 'desc' },
        { lastAccessedAt: 'desc' },
      ],
      take: limit,
    });

    // Update last accessed time
    if (memories.length > 0) {
      await this.prisma.memory.updateMany({
        where: {
          id: { in: memories.map((m) => m.id) },
        },
        data: {
          lastAccessedAt: new Date(),
        },
      });
    }

    return memories as Memory[];
  }

  async createMemory(
    userId: string,
    type: 'fact' | 'preference' | 'event' | 'quote' | 'milestone',
    content: string,
    importance: number = 50,
    characterId?: string,
    chatId?: string,
    metadata?: Record<string, unknown>
  ): Promise<Memory> {
    // Generate embedding for semantic search
    const embedding = await this.openaiService.createEmbedding(content);

    const memory = await this.prisma.memory.create({
      data: {
        userId,
        characterId,
        chatId,
        type,
        content,
        importance,
        embedding: JSON.stringify(embedding),
        metadata,
      },
    });

    return memory as Memory;
  }

  async processConversation(
    userId: string,
    characterId: string,
    chatId: string,
    messages: any[]
  ): Promise<void> {
    // Extract important facts, preferences, and events from conversation
    const conversationText = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Use AI to extract memories
    const extractedMemories = await this.openaiService.extractMemories(conversationText);

    for (const memory of extractedMemories) {
      await this.createMemory(
        userId,
        memory.type,
        memory.content,
        memory.importance,
        characterId,
        chatId,
        memory.metadata
      );
    }

    // Check if we need to create/update memory summary
    const messageCount = messages.length;
    if (messageCount % 20 === 0) {
      await this.updateMemorySummary(userId, characterId);
    }
  }

  async updateMemorySummary(userId: string, characterId?: string): Promise<MemorySummary> {
    const memories = await this.getRelevantMemories(userId, characterId, 50);

    if (memories.length === 0) {
      return null;
    }

    // Generate summary using AI
    const summary = await this.openaiService.generateMemorySummary(memories);
    const keyFacts = memories
      .filter((m) => m.importance >= 70)
      .map((m) => m.content)
      .slice(0, 10);

    const existing = await this.prisma.memorySummary.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId: characterId || null,
        },
      },
    });

    if (existing) {
      return this.prisma.memorySummary.update({
        where: { id: existing.id },
        data: {
          summary: summary.summary,
          keyFacts,
          lastUpdated: new Date(),
        },
      }) as Promise<MemorySummary>;
    } else {
      return this.prisma.memorySummary.create({
        data: {
          userId,
          characterId: characterId || null,
          summary: summary.summary,
          keyFacts,
        },
      }) as Promise<MemorySummary>;
    }
  }

  async getMemorySummary(userId: string, characterId?: string): Promise<MemorySummary | null> {
    const summary = await this.prisma.memorySummary.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId: characterId || null,
        },
      },
    });

    return summary as MemorySummary | null;
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    const memory = await this.prisma.memory.findUnique({
      where: { id: memoryId },
    });

    if (!memory || memory.userId !== userId) {
      throw new Error('Memory not found or access denied');
    }

    await this.prisma.memory.delete({
      where: { id: memoryId },
    });
  }
}

