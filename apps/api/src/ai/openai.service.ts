import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatStreamChunk, Memory } from '@amora/types';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async chatCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }): Promise<{ content: string; usage?: any; model: string }> {
    const response = await this.openai.chat.completions.create({
      model: params.model,
      messages: params.messages as any,
      temperature: params.temperature || 0.8,
      max_tokens: params.max_tokens || 2000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
      model: response.model,
    };
  }

  async *chatCompletionStream(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }): AsyncGenerator<ChatStreamChunk> {
    const stream = await this.openai.chat.completions.create({
      model: params.model,
      messages: params.messages as any,
      temperature: params.temperature || 0.8,
      max_tokens: params.max_tokens || 2000,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        yield { type: 'token', content };
      }
    }

    yield { type: 'done', metadata: { content: fullContent } };
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  async extractMemories(conversationText: string): Promise<Array<{ type: string; content: string; importance: number; metadata?: any }>> {
    const prompt = `Analyze this conversation and extract important memories:
- Facts about the user (birthday, preferences, important events)
- Preferences (likes, dislikes, hobbies)
- Emotional events (milestones, meaningful moments)
- Memorable quotes

Return as JSON array with: type (fact/preference/event/quote/milestone), content, importance (0-100), metadata (optional)

Conversation:
${conversationText}`;

    const response = await this.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a memory extraction assistant. Return only valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      return [];
    }
  }

  async generateMemorySummary(memories: Memory[]): Promise<{ summary: string }> {
    const memoryText = memories.map((m) => `[${m.type}] ${m.content}`).join('\n');

    const prompt = `Create a concise summary of these memories about the user. Focus on key facts, preferences, and relationship dynamics.

Memories:
${memoryText}`;

    const response = await this.chatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a memory summarization assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return { summary: response.content };
  }
}

