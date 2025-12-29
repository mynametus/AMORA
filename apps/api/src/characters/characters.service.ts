import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Character, PaginatedResponse } from '@amora/types';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    filters?: { archetype?: string; isPremium?: boolean; tags?: string[] }
  ): Promise<PaginatedResponse<Character>> {
    const skip = (page - 1) * pageSize;
    const where: any = {
      isPublic: true,
    };

    if (filters?.archetype) {
      where.archetype = filters.archetype;
    }

    if (filters?.isPremium !== undefined) {
      where.isPremium = filters.isPremium;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.character.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.character.count({ where }),
    ]);

    return {
      items: items as Character[],
      total,
      page,
      pageSize,
      hasMore: skip + pageSize < total,
    };
  }

  async findById(id: string): Promise<Character> {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character as Character;
  }

  async create(userId: string, dto: CreateCharacterDto): Promise<Character> {
    const character = await this.prisma.character.create({
      data: {
        ...dto,
        creatorId: userId,
        isPublic: false, // User-created characters are private by default
      },
    });

    return character as Character;
  }

  async update(userId: string, id: string, dto: UpdateCharacterDto): Promise<Character> {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (character.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own characters');
    }

    const updated = await this.prisma.character.update({
      where: { id },
      data: dto,
    });

    return updated as Character;
  }

  async delete(userId: string, id: string): Promise<void> {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (character.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own characters');
    }

    await this.prisma.character.delete({
      where: { id },
    });
  }
}

