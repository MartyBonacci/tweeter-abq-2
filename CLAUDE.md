# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a **mentor reference implementation** that students will study as an exemplar. Code clarity and exemplary patterns are paramount. Every file should demonstrate best practices clearly enough that a student can read it and understand the "right way" to build with this stack. Favor readability over cleverness.

## Overview

Tweeter is a simplified Twitter clone (140-character era, blue-and-white aesthetic) built with React Router v7 in framework mode. The project follows an API-first, three-layer architecture with a functional programming style.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npx react-router typegen # Regenerate route types after changing routes.ts
psql $DATABASE_URL < migrations/001-initial-schema.sql  # Run DB migration
```

## Architecture: Three-Layer API-First Design

```
Page Routes (app/routes/*.tsx) ──fetch()──> API Routes (app/routes/api/v1/*.tsx) ──call──> Services (app/services/*.server.ts) ──query──> PostgreSQL
```

### Critical Rules

1. **Page routes NEVER import services or query the DB directly.** They call the internal REST API via `fetch()`, forwarding the session cookie.
2. **API routes (`/api/v1/*`) are the single source of truth** for all data operations. They accept/return JSON, validate with Zod, and delegate to services.
3. **Services are pure functions** — they accept validated plain data (not Request objects) and return typed results. All DB queries live here.
4. **Loaders and actions are thin** — max ~15 lines. If longer, extract logic into a service function.

### Route Types

Each route imports from its auto-generated `+types` directory:
```typescript
import type { Route } from "./+types/routename";
export async function loader({ request }: Route.LoaderArgs) { ... }
export async function action({ request }: Route.ActionArgs) { ... }
export default function Component({ loaderData }: Route.ComponentProps) { ... }
```

### Programmatic Routes

All routes are defined in `app/routes.ts` using `RouteConfig[]`. **NOT file-based routing.**

## Conventions

- **Functional programming only** — no classes, no OOP patterns. Pure functions, composition, immutable data.
- **TypeScript strict mode** — use `z.infer<typeof schema>` over manual interfaces. No `any`.
- **Zod validation everywhere** — frontend (UX) and backend API routes (security). Shared schemas in `app/utils/validation.ts`.
- **Server-first data flow** — loaders for fetching, actions for mutations. No `useEffect` for data, no client-side fetch for writes.
- **Progressive enhancement** — forms work without JavaScript.
- **Dual auth** — cookie sessions (web) + bearer tokens (mobile). API checks bearer first, falls back to cookie. Both resolve to the same user profile.
- **Raw SQL only** — parameterized queries via `postgres` package. No ORMs. `camelCase` ↔ `snake_case` mapping handled by the DB client.
- **uuidv7** for all IDs.

## Tech Stack

- **Framework**: React Router v7 (framework mode)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod (shared schemas in `app/utils/validation.ts`)
- **Database**: PostgreSQL via Neon, `postgres` npm package
- **Auth**: @node-rs/argon2 for password hashing, `createCookieSessionStorage` for sessions
- **Storage**: Cloudinary for avatar uploads

## Database Tables

- **profiles**: id (uuidv7), username (unique), email (unique), password_hash, bio, avatar_url, created_at
- **tweets**: id (uuidv7), profile_id (FK), content (140 chars max), created_at
- **likes**: tweet_id + profile_id (composite PK), created_at
