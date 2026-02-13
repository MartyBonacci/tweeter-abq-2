# Project Constitution

## Project Identity

- **Name**: Tweeter
- **Description**: A simplified Twitter clone styled like the 140-character era with a classic blue-and-white aesthetic. API-first architecture designed to serve both web and future mobile clients.
- **Created**: 2026-02-12

## Governing Principles

### 1. API-First Architecture
All business logic is exposed through versioned REST endpoints (`/api/v1/*`). Web page routes consume the API via internal `fetch()` calls — they never import services or query the database directly. This proves the API contract works before any external client is built.

### 2. Functional Programming Only
No classes, no OOP patterns. Pure functions, composition, and immutable data transformations everywhere. Services are pure functions that accept validated plain data and return typed results.

### 3. Three-Layer Separation
- **Page routes** — thin orchestrators (~15 lines max), forward cookies, call API, return data or redirect
- **API routes** — validate requests with Zod, delegate to services, return JSON
- **Services** — all business logic and DB queries, accept plain data, return typed results

### 4. Type Safety End-to-End
TypeScript strict mode. Zod-inferred types (`z.infer<typeof schema>`) over manual interfaces. No `any` types. Zod validation on both frontend (UX) and backend (security).

### 5. Server-First Progressive Enhancement
React Router v7 loaders for data fetching, actions for mutations. No `useEffect` for data, no client-side fetch for writes. Forms work without JavaScript.

## Architecture Rules

- All routes defined programmatically in `app/routes.ts` using `RouteConfig[]` — NOT file-based routing
- Route types imported from auto-generated `+types` directory
- Raw parameterized SQL only — no ORMs
- Dual auth: cookie sessions (web) + bearer tokens (mobile), both resolve to same user profile
- uuidv7 for all entity IDs
- `camelCase` ↔ `snake_case` mapping handled by the DB client

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-12 | API-first with internal fetch | Proves REST API works before mobile clients exist |
| 2026-02-12 | Raw SQL over ORM | Full control, simpler mental model, no abstraction leaks |
| 2026-02-12 | Dual auth (cookie + bearer) | Single API serves both web and mobile without separate endpoints |
| 2026-02-12 | Programmatic routes | Explicit route config over magic file-based conventions |
