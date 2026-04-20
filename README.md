# Emotion Diary

Emotion Diary is an app for keeping emotional journal entries with analytics.

## Stack
- Web: React + Vite
- Backend: Node.js + Express + PostgreSQL
- Mobile: Expo (React Native)
- Messaging: Kafka
- APIs: REST + gRPC

## Quick start
### 1) Infrastructure
```bash
docker compose up -d
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Web frontend
```bash
npm install
npm run dev
```

## Default local endpoints
- REST API: `http://localhost:5001/api`
- gRPC: `localhost:50051`
- Web app: `http://localhost:5173`
