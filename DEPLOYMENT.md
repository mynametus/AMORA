# Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6
- Environment variables configured

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
cd apps/api
npm run prisma:generate
npm run migration:run
```

### 3. Environment Variables

Copy and configure environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Update with your actual values:
- Database connection string
- JWT secret
- OAuth credentials
- OpenAI API key
- Vector DB credentials
- AWS S3 credentials (for media storage)

### 4. Development

```bash
# Run all services
npm run dev

# Or run individually
cd apps/api && npm run dev
cd apps/web && npm run dev
```

## Production Deployment

### Backend (NestJS)

1. Build:
```bash
cd apps/api
npm run build
```

2. Run migrations:
```bash
npm run migration:run
```

3. Start:
```bash
npm run start:prod
```

### Frontend (Next.js)

1. Build:
```bash
cd apps/web
npm run build
```

2. Start:
```bash
npm run start
```

### Docker (Optional)

Create `Dockerfile` for each service and use docker-compose for orchestration.

## Infrastructure Recommendations

- **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Cache**: Managed Redis (AWS ElastiCache, Google Memorystore)
- **Storage**: AWS S3 or Google Cloud Storage for media
- **CDN**: CloudFront or Cloud CDN for static assets
- **Vector DB**: Pinecone or Weaviate Cloud
- **Monitoring**: Sentry for error tracking, DataDog/New Relic for APM
- **Logging**: CloudWatch Logs or Google Cloud Logging

## Environment Variables Checklist

### Backend (.env)
- [ ] DATABASE_URL
- [ ] REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- [ ] JWT_SECRET, JWT_EXPIRES_IN
- [ ] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
- [ ] OPENAI_API_KEY, OPENAI_MODEL
- [ ] PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME
- [ ] ELEVENLABS_API_KEY
- [ ] AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
- [ ] MODERATION_API_KEY
- [ ] PORT, CORS_ORIGIN

### Frontend (.env)
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_WS_URL

