// User & Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  language: 'en' | 'vi' | 'es' | 'pt';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  preferredThemes: RPTheme[];
  sweetnessLevel: 'sweet' | 'serious' | 'playful';
  contentMaturity: 'safe' | 'mature' | 'explicit';
  notificationSettings: NotificationSettings;
}

export type RPTheme = 'modern' | 'fantasy' | 'anime' | 'sci-fi' | 'historical' | 'romance';

export interface NotificationSettings {
  checkIns: boolean;
  reminders: boolean;
  updates: boolean;
}

// Character Types
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  archetype: CharacterArchetype;
  personality: PersonalityTraits;
  voice: VoiceSettings;
  boundaries: CharacterBoundaries;
  creatorId?: string;
  isPublic: boolean;
  isPremium: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CharacterArchetype =
  | 'sweet-romantic'
  | 'tsundere'
  | 'yandere'
  | 'gentle-giant'
  | 'mysterious'
  | 'cheerful'
  | 'cool-tsundere'
  | 'childhood-friend'
  | 'senpai'
  | 'kohai'
  | 'vampire'
  | 'elf'
  | 'demon'
  | 'angel'
  | 'cyborg'
  | 'custom';

export interface PersonalityTraits {
  warmth: number; // 0-100
  playfulness: number; // 0-100
  seriousness: number; // 0-100
  emotionalDepth: number; // 0-100
  traits: string[]; // e.g., ["kind", "curious", "protective"]
}

export interface VoiceSettings {
  provider: 'elevenlabs' | 'openai' | 'azure';
  voiceId: string;
  speed: number; // 0.5-2.0
  pitch: number; // -20 to +20
  style: 'warm' | 'gentle' | 'cheerful' | 'mysterious' | 'playful';
}

export interface CharacterBoundaries {
  maxRomanceLevel: 'sweet' | 'romantic' | 'intimate' | 'explicit';
  allowedTopics: string[];
  blockedTopics: string[];
  safeMode: boolean;
}

// Chat Types
export interface Chat {
  id: string;
  userId: string;
  characterId: string;
  title?: string;
  scene?: SceneContext;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  metadata?: MessageMetadata;
  createdAt: Date;
}

export interface MessageMetadata {
  emotion?: string;
  memoryTriggers?: string[];
  tokensUsed?: number;
  latency?: number;
}

export interface SceneContext {
  setting: string;
  background: string;
  characters: string[];
  mood: string;
  chapter?: number;
}

// Memory Types
export interface Memory {
  id: string;
  userId: string;
  characterId?: string;
  chatId?: string;
  type: 'fact' | 'preference' | 'event' | 'quote' | 'milestone';
  content: string;
  importance: number; // 0-100
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface MemorySummary {
  userId: string;
  characterId?: string;
  summary: string;
  keyFacts: string[];
  lastUpdated: Date;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'premium_weekly' | 'premium_monthly' | 'premium_annual';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionLimits {
  tier: SubscriptionTier;
  messagesPerDay: number; // -1 for unlimited
  voiceMessagesPerDay: number;
  imageGenerationsPerDay: number;
  maxMemoryEntries: number;
  features: {
    unlimitedChat: boolean;
    hdVoice: boolean;
    imageGeneration: boolean;
    advancedMemory: boolean;
    proactiveCheckIns: boolean;
    premiumCharacters: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Chat Streaming Types
export interface ChatStreamChunk {
  type: 'token' | 'metadata' | 'error' | 'done';
  content?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

// Content Safety Types
export interface ContentModerationResult {
  isSafe: boolean;
  violations: ModerationViolation[];
  confidence: number;
}

export interface ModerationViolation {
  type: 'hate' | 'harassment' | 'self-harm' | 'sexual' | 'violence' | 'illegal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

// Analytics Types
export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface UserMetrics {
  userId: string;
  sessionLength: number;
  messagesSent: number;
  messagesReceived: number;
  charactersInteracted: number;
  retentionDay: number;
  lastActiveAt: Date;
}

