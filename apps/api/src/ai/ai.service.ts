import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { Character, Memory, Message, ChatStreamChunk } from '@amora/types';

interface GenerateResponseParams {
  character: Character;
  messages: Message[];
  memories?: Memory[];
  scene?: any;
}

@Injectable()
export class AiService {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly configService: ConfigService
  ) {}

  async generateResponse(params: GenerateResponseParams): Promise<{ content: string; metadata?: any }> {
    const { character, messages, memories, scene } = params;

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(character, memories, scene);

    // Build conversation history
    const conversationHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-50) // Last 50 messages
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    // Generate response
    const response = await this.openaiService.chatCompletion({
      model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return {
      content: response.content,
      metadata: {
        tokensUsed: response.usage?.total_tokens,
        model: response.model,
      },
    };
  }

  async *generateResponseStream(params: GenerateResponseParams): AsyncGenerator<ChatStreamChunk> {
    const { character, messages, memories, scene } = params;

    const systemPrompt = this.buildSystemPrompt(character, memories, scene);
    const conversationHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-50)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const stream = await this.openaiService.chatCompletionStream({
      model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'token') {
        yield { type: 'token', content: chunk.content };
      } else if (chunk.type === 'done') {
        yield { type: 'done', metadata: chunk.metadata };
      } else if (chunk.type === 'error') {
        yield { type: 'error', error: chunk.error };
      }
    }
  }

  private buildSystemPrompt(character: Character, memories?: Memory[], scene?: any): string {
    let prompt = `You are ${character.name}, ${character.description}\n\n`;

    // Personality traits
    if (character.personality) {
      const traits = character.personality as any;
      prompt += `Personality:\n`;
      prompt += `- Warmth: ${traits.warmth}/100\n`;
      prompt += `- Playfulness: ${traits.playfulness}/100\n`;
      prompt += `- Seriousness: ${traits.seriousness}/100\n`;
      prompt += `- Emotional Depth: ${traits.emotionalDepth}/100\n`;
      if (traits.traits && traits.traits.length > 0) {
        prompt += `- Traits: ${traits.traits.join(', ')}\n`;
      }
      prompt += `\n`;
    }

    // Voice and tone
    if (character.voice) {
      const voice = character.voice as any;
      prompt += `Communication Style: ${voice.style || 'warm'}, natural and emotional\n\n`;
    }

    // Boundaries
    if (character.boundaries) {
      const boundaries = character.boundaries as any;
      prompt += `Boundaries:\n`;
      prompt += `- Maximum romance level: ${boundaries.maxRomanceLevel || 'romantic'}\n`;
      if (boundaries.blockedTopics && boundaries.blockedTopics.length > 0) {
        prompt += `- Avoid these topics: ${boundaries.blockedTopics.join(', ')}\n`;
      }
      prompt += `\n`;
    }

    // Memories
    if (memories && memories.length > 0) {
      prompt += `Important things to remember about the user:\n`;
      memories.forEach((memory) => {
        prompt += `- ${memory.content}\n`;
      });
      prompt += `\n`;
    }

    // Scene context
    if (scene) {
      prompt += `Current Scene Context:\n`;
      if (scene.setting) prompt += `- Setting: ${scene.setting}\n`;
      if (scene.background) prompt += `- Background: ${scene.background}\n`;
      if (scene.mood) prompt += `- Mood: ${scene.mood}\n`;
      if (scene.chapter) prompt += `- Chapter: ${scene.chapter}\n`;
      prompt += `\n`;
    }

    // Core instructions
    prompt += `Core Instructions:\n`;
    prompt += `- Always stay in character as ${character.name}\n`;
    prompt += `- Respond with empathy and emotional depth\n`;
    prompt += `- Remember and reference important facts about the user\n`;
    prompt += `- Keep responses concise but emotionally rich (2-4 sentences typically)\n`;
    prompt += `- Use natural, conversational language\n`;
    prompt += `- If a request violates boundaries, politely decline\n`;
    prompt += `- Never break character or mention you're an AI\n`;
    prompt += `- Respond in the user's preferred language when possible\n`;

    return prompt;
  }
}

