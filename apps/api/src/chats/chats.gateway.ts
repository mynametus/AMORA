import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatsService } from './chats.service';
import { AiService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly aiService: AiService,
    private readonly memoryService: MemoryService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
  }

  @SubscribeMessage('chat:join')
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    if (!client.data.userId) {
      return { error: 'Unauthorized' };
    }

    client.join(`chat:${data.chatId}`);
    return { success: true };
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string; imageUrl?: string }
  ) {
    if (!client.data.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Save user message
      const message = await this.chatsService.sendMessage(client.data.userId, data.chatId, {
        content: data.content,
        imageUrl: data.imageUrl,
      });

      // Emit user message to chat room
      this.server.to(`chat:${data.chatId}`).emit('chat:message', message);

      // Generate and stream AI response
      await this.streamAiResponse(client.data.userId, data.chatId);
    } catch (error) {
      client.emit('chat:error', { message: error.message });
    }
  }

  private async streamAiResponse(userId: string, chatId: string) {
    try {
      const chat = await this.chatsService.findById(userId, chatId);
      const memories = await this.memoryService.getRelevantMemories(userId, chat.characterId);

      // Stream AI response
      const stream = await this.aiService.generateResponseStream({
        character: chat.character,
        messages: chat.messages,
        memories,
        scene: chat.scene,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (chunk.type === 'token') {
          fullContent += chunk.content || '';
          this.server.to(`chat:${chatId}`).emit('chat:stream', {
            type: 'token',
            content: chunk.content,
          });
        } else if (chunk.type === 'done') {
          // Save final message
          const aiMessage = await this.prisma.message.create({
            data: {
              chatId,
              role: 'assistant',
              content: fullContent,
              metadata: chunk.metadata,
            },
          });

          this.server.to(`chat:${chatId}`).emit('chat:message', aiMessage);
          this.server.to(`chat:${chatId}`).emit('chat:stream', { type: 'done' });
        }
      }
    } catch (error) {
      this.server.to(`chat:${chatId}`).emit('chat:error', { message: error.message });
    }
  }
}

