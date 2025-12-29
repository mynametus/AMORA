# Architecture Overview

## System Architecture

```
┌─────────────────┐
│   Next.js Web   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  NestJS API     │
│  (Backend)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    │        │          │          │          │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Postgres│ │Redis │ │OpenAI │ │Pinecone│ │  S3   │
│   DB   │ │Cache │ │  API  │ │VectorDB│ │Storage│
└────────┘ └──────┘ └───────┘ └────────┘ └───────┘
```

## Key Components

### Frontend (Next.js)
- **Pages**: Auth, Dashboard, Chat, Characters, Onboarding
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Real-time**: Socket.io Client
- **Styling**: TailwindCSS

### Backend (NestJS)
- **Modules**:
  - Auth: JWT, OAuth (Google, Apple)
  - Users: User management, preferences
  - Characters: Character catalog, creation
  - Chats: Chat management, WebSocket gateway
  - Memory: Long-term memory, RAG
  - AI: LLM integration, streaming
  - Content Moderation: Safety filters
  - Subscription: Tier management, limits

### Database Schema
- **Users**: Authentication, preferences
- **Characters**: Character definitions, traits
- **Chats**: Conversation threads
- **Messages**: Individual messages
- **Memories**: Long-term memory storage
- **Subscriptions**: User subscription tiers

### AI Integration
- **LLM**: OpenAI GPT-4 for conversation
- **Embeddings**: OpenAI for semantic search
- **Memory**: Vector DB for RAG
- **TTS/STT**: ElevenLabs (future)

## Data Flow

### Chat Flow
1. User sends message → Frontend
2. Frontend → API (WebSocket)
3. API validates & moderates content
4. API retrieves relevant memories
5. API generates system prompt with character + memories
6. API streams response from LLM
7. API saves message & updates memories
8. Frontend displays streaming response

### Memory Flow
1. Conversation happens
2. Every 20 messages: Extract memories using AI
3. Generate embeddings for memories
4. Store in vector DB
5. Retrieve relevant memories for context

## Security

- JWT authentication
- Content moderation (keyword + AI)
- Rate limiting
- Input validation
- SQL injection prevention (Prisma)
- XSS prevention (React)

## Performance Optimizations

- Redis caching for frequent queries
- Connection pooling (Prisma)
- Streaming responses (WebSocket)
- Token budgeting for LLM
- Batch embedding generation
- CDN for static assets

## Scalability

- Stateless API (horizontal scaling)
- Database connection pooling
- Redis for session management
- Queue system for async tasks (future)
- Load balancer for multiple instances

