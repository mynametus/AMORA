import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@amora/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return this.usersService.sanitizeUser(user);
  }

  async register(email: string, password: string, name?: string): Promise<{ user: User; token: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      include: {
        preferences: true,
      },
    });

    // Create default preferences
    await this.prisma.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: this.usersService.sanitizeUser(user),
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  async oauthLogin(provider: 'google' | 'apple', profile: any): Promise<{ user: User; token: string }> {
    const email = profile.email || profile.id;
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name || profile.displayName,
          avatar: profile.picture || profile.photo,
          emailVerified: true,
        },
        include: {
          preferences: true,
        },
      });

      // Create default preferences
      await this.prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    return {
      user: this.usersService.sanitizeUser(user),
      token,
    };
  }

  generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.sub, email: payload.email };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

