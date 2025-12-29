import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserPreferences } from '@amora/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { preferences: true },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.preferences) {
      return this.prisma.userPreferences.create({
        data: {
          userId,
          ...preferences,
        },
      });
    }

    return this.prisma.userPreferences.update({
      where: { userId },
      data: preferences,
    });
  }

  sanitizeUser(user: any): User {
    const { password, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }
}

