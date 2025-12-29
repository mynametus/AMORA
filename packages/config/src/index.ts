import { SubscriptionLimits, SubscriptionTier } from '@amora/types';

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    tier: 'free',
    messagesPerDay: 50,
    voiceMessagesPerDay: 5,
    imageGenerationsPerDay: 3,
    maxMemoryEntries: 20,
    features: {
      unlimitedChat: false,
      hdVoice: false,
      imageGeneration: false,
      advancedMemory: false,
      proactiveCheckIns: false,
      premiumCharacters: false,
    },
  },
  premium_weekly: {
    tier: 'premium_weekly',
    messagesPerDay: -1,
    voiceMessagesPerDay: -1,
    imageGenerationsPerDay: 50,
    maxMemoryEntries: 1000,
    features: {
      unlimitedChat: true,
      hdVoice: true,
      imageGeneration: true,
      advancedMemory: true,
      proactiveCheckIns: true,
      premiumCharacters: true,
    },
  },
  premium_monthly: {
    tier: 'premium_monthly',
    messagesPerDay: -1,
    voiceMessagesPerDay: -1,
    imageGenerationsPerDay: 100,
    maxMemoryEntries: 2000,
    features: {
      unlimitedChat: true,
      hdVoice: true,
      imageGeneration: true,
      advancedMemory: true,
      proactiveCheckIns: true,
      premiumCharacters: true,
    },
  },
  premium_annual: {
    tier: 'premium_annual',
    messagesPerDay: -1,
    voiceMessagesPerDay: -1,
    imageGenerationsPerDay: 200,
    maxMemoryEntries: 5000,
    features: {
      unlimitedChat: true,
      hdVoice: true,
      imageGeneration: true,
      advancedMemory: true,
      proactiveCheckIns: true,
      premiumCharacters: true,
    },
  },
};

export const CHARACTER_ARCHETYPES = [
  'sweet-romantic',
  'tsundere',
  'yandere',
  'gentle-giant',
  'mysterious',
  'cheerful',
  'cool-tsundere',
  'childhood-friend',
  'senpai',
  'kohai',
  'vampire',
  'elf',
  'demon',
  'angel',
  'cyborg',
] as const;

export const RP_THEMES = ['modern', 'fantasy', 'anime', 'sci-fi', 'historical', 'romance'] as const;

export const SUPPORTED_LANGUAGES = ['en', 'vi', 'es', 'pt'] as const;

export const CONTENT_MATURITY_LEVELS = ['safe', 'mature', 'explicit'] as const;

export const MAX_CHAT_HISTORY_LENGTH = 100; // messages
export const MEMORY_SUMMARY_INTERVAL = 20; // messages
export const MAX_MEMORY_IMPORTANCE = 100;
export const MIN_MEMORY_IMPORTANCE = 0;

export const CHAT_RESPONSE_TIMEOUT = 30000; // 30 seconds
export const MAX_TOKENS_PER_MESSAGE = 2000;
export const MAX_CONTEXT_TOKENS = 8000;

export const SAFE_WORDS = [
  'stop',
  'pause',
  'boundary',
  'slow down',
  'too much',
  'uncomfortable',
];

export const MODERATION_KEYWORDS = {
  hate: ['hate', 'kill', 'die', 'suicide', 'self-harm'],
  harassment: ['harass', 'bully', 'threaten'],
  illegal: ['drug', 'illegal', 'underage'],
  // Add more as needed
};

