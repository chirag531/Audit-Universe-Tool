# Audit Universe
![image alt](https://github.com/chirag531/Audit-Universe-Tool/blob/main/home.jpeg)
# Overview
This repository contains a production-oriented full stack implementation:
- Backend: Spring Boot 3 + Java 17 with JWT, refresh tokens, RBAC, Flyway migrations, OpenAPI bearer auth.
- AI service: Flask 3 with sanitizer middleware, 30 req/min limiter, security headers, Groq retries/cache/fallback.
- Frontend: React 18 + Vite + Tailwind with auth flow, protected routes, dashboard/list/detail/analytics pages.
- Data: PostgreSQL + Redis
- Orchestration: Docker Compose (exactly 5 services: postgres, redis, backend, ai-service, frontend)

## Security and behavior highlights
- JWT authentication and role-based endpoint protection
- Soft-delete persistence model for users and audit records
- AI client fallback handling when AI service is unavailable
- Flask input sanitization, rate limiting, API key auth, and response security headers
- Frontend protected routes with role-aware UX states

## Run checks
- `cd frontend; npm install; npm run build`
- `cd backend; mvn test` (or use local Maven wrapper if configured)
- `cd ai-service; pytest`
- `docker compose config`

## Run stack
1. Copy `.env.example` to `.env` and set secure values.
2. Run: `docker compose up --build`
