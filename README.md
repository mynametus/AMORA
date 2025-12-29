# Amora - AI Roleplay & Dating Companion

Ứng dụng trò chuyện AI cảm xúc với nhân vật nhập vai, tập trung vào trải nghiệm đồng hành 24/7.

## 🏗️ Kiến trúc

Monorepo sử dụng Turbo với các packages:

- **apps/web**: Next.js frontend (React, TypeScript, TailwindCSS)
- **apps/api**: NestJS backend (Node.js, TypeScript)
- **packages/types**: Shared TypeScript types
- **packages/ui**: Shared UI components
- **packages/config**: Shared configurations

## 🚀 Bắt đầu

### Yêu cầu
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 6

### Cài đặt

```bash
# Install dependencies
npm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run database migrations
cd apps/api
npm run migration:run

# Start development servers
npm run dev
```

## 📦 Tính năng MVP

- ✅ Authentication (Email, OAuth)
- ✅ Onboarding với sở thích
- ✅ Character catalog (>100 archetypes)
- ✅ Custom character creation
- ✅ Chat system với LLM streaming
- ✅ Memory system (short-term + long-term)
- ✅ Subscription & payments
- ✅ Content safety & moderation
- ✅ i18n (EN/VI)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Shadcn UI
- Zustand (state management)
- TanStack Query (data fetching)
- i18next (internationalization)

**Backend:**
- NestJS
- PostgreSQL (Prisma ORM)
- Redis (cache)
- Vector DB (Pinecone/Weaviate for memory)
- WebSocket (real-time chat)
- JWT authentication

**AI/ML:**
- LLM API (OpenAI/Anthropic)
- TTS/STT (ElevenLabs/OpenAI)
- Image generation (DALL-E/Midjourney API)
- Vector embeddings (OpenAI)

## 📝 License

Private - All rights reserved

# AMORA
