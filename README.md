# Tweeter

A simplified Twitter clone styled like the 140-character era with a classic blue-and-white aesthetic.

## Features

- User signup and signin (authentication)
- Tweet posting (140 character limit)
- Tweet feed (newest first)
- Delete own tweets
- Like tweets
- User profiles (bio, avatar)
- Profile avatar upload (Cloudinary)
- View other user profiles and their tweets

## Architecture

### Three-Layer Design

```
Client (Web / Mobile)
        |
   API Layer ─── /api/v1/* resource routes (JSON in, JSON out)
        |
  Service Layer ─── app/services/*.server.ts (business logic, DB queries)
        |
    Database ─── PostgreSQL via Neon
```

- **API Layer** (`app/routes/api/v1/`) — Versioned REST endpoints that serve as the single source of truth for all data operations. Every endpoint accepts and returns JSON. Handles authentication (cookie or bearer token) and delegates to the service layer.
- **Service Layer** (`app/services/*.server.ts`) — Pure functions containing all business logic: validation, database queries, and data transformations. Services accept validated input and return typed results. No request/response objects — only plain data in, plain data out.
- **Web Layer** (`app/routes/`) — React Router v7 page routes with thin loaders and actions. These consume the API layer via internal `fetch()` calls, proving the API contract works before any mobile client is built. Page routes never import service functions or query the database directly.

### API-First Data Flow

Page route loaders and actions call the internal REST API — they do NOT query the database directly:

```typescript
// app/routes/feed.tsx — page route (thin, delegates to API)
export async function loader({ request }: Route.LoaderArgs) {
  const response = await fetch(new URL("/api/v1/tweets", request.url), {
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });
  if (!response.ok) throw new Response("Failed to load feed", { status: response.status });
  const { tweets, user } = await response.json();
  return { tweets, user };
}
```

```typescript
// app/routes/api/v1/tweets.tsx — API resource route (owns the logic)
export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticateRequest(request);
  const tweets = await tweetService.getFeed(user.id);
  return Response.json({ tweets, user });
}
```

This ensures the REST API is exercised and proven by the web app itself before mobile clients are built.

## Architecture Conventions

- **API-first development** — All business logic is exposed through `/api/v1/` resource routes. Web page loaders/actions consume these via internal `fetch()`.
- **Loaders and actions are thin** — They forward the session cookie, call the API, and return/redirect. Max ~15 lines per handler. No direct DB access in page routes.
- **Services own the logic** — Validation, DB queries, and business rules live in the service layer. API routes call service functions. Page routes call API routes.
- **Functional programming only** — No classes or OOP patterns. Pure functions, composition, and immutable data transformations.
- **Programmatic routes** — All routes defined in `app/routes.ts` using `RouteConfig[]`. NOT file-based routing.
- **Zod validation everywhere** — Frontend: Zod schemas for form validation (UX). Backend: Zod schemas in API routes for request validation (security). Shared schemas where possible.
- **Server-first data flow** — React Router v7 loaders for data fetching (no useEffect for data). React Router v7 actions for mutations (no client-side fetch for writes). Progressive enhancement — forms work without JavaScript.
- **Type safety end-to-end** — TypeScript strict mode. Zod-inferred types (`z.infer<typeof schema>`) over manual interfaces. No `any` types.

## Project Structure

```
app/
├── routes.ts                  # Programmatic route config (RouteConfig[])
├── root.tsx                   # Root layout, navbar, loads optional user
├── routes/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.signup.tsx    # POST /api/v1/auth/signup
│   │       ├── auth.signin.tsx    # POST /api/v1/auth/signin
│   │       ├── auth.signout.tsx   # POST /api/v1/auth/signout
│   │       ├── tweets.tsx         # GET/POST /api/v1/tweets
│   │       ├── tweets.$id.tsx     # DELETE /api/v1/tweets/:id
│   │       ├── tweets.$id.like.tsx # POST /api/v1/tweets/:id/like
│   │       └── profiles.$username.tsx # GET/PATCH /api/v1/profiles/:username
│   ├── landing.tsx            # GET / (public landing page)
│   ├── signup.tsx             # GET/POST /signup (form + action calls API)
│   ├── signin.tsx             # GET/POST /signin (form + action calls API)
│   ├── feed.tsx               # GET /feed (authenticated tweet timeline)
│   └── profile.$username.tsx  # GET /profile/:username (user profile page)
├── services/                  # Business logic (pure functions)
│   ├── auth.server.ts         # signup, signin, validateToken, hashPassword
│   ├── tweets.server.ts       # createTweet, getFeed, deleteTweet
│   ├── likes.server.ts        # toggleLike, getLikeCount, isLikedByUser
│   └── profiles.server.ts    # getProfile, updateProfile, uploadAvatar
├── utils/                     # Infrastructure helpers
│   ├── db.server.ts           # postgres client with camelCase transform
│   ├── session.server.ts      # cookie session config (createCookieSessionStorage)
│   ├── api.server.ts          # internal API fetch helper for page routes
│   ├── auth.server.ts         # authenticateRequest (resolve cookie or bearer token)
│   ├── cloudinary.server.ts   # avatar upload to Cloudinary
│   └── validation.ts          # shared Zod schemas (signup, signin, tweet, profileEdit)
└── components/                # Reusable UI components
```

## Service Layer Convention

- **Services** (`app/services/*.server.ts`) contain all business logic as pure exported functions.
- They accept validated plain data (not Request objects) and return typed results.
- Services handle their own DB queries via the `postgres` client from `utils/db.server.ts`.
- **API routes** parse and validate the request, call the appropriate service function(s), and return `Response.json()`.
- **Page routes** are thin orchestrators: forward cookies to the internal API via `fetch()`, handle the response, return data or redirect.
- If a loader or action exceeds ~15 lines, the logic belongs in a service function.

## API Endpoints

All endpoints return JSON. Prefix: `/api/v1`

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/signup` | Create account, returns token + profile | None |
| POST | `/api/v1/auth/signin` | Authenticate, returns token + profile | None |
| POST | `/api/v1/auth/signout` | Invalidate session/token | Required |

### Tweets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/tweets` | Feed (newest first, paginated) | Required |
| POST | `/api/v1/tweets` | Create tweet (140 char max) | Required |
| DELETE | `/api/v1/tweets/:id` | Delete own tweet | Required (owner only) |

### Likes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/tweets/:id/like` | Toggle like on a tweet | Required |

### Profiles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/profiles/:username` | Public profile + their tweets | Optional |
| PATCH | `/api/v1/profiles/me` | Update own bio/avatar (multipart for avatar) | Required |

### Authentication Methods

- **Web clients**: Cookie-based sessions via `createCookieSessionStorage`. Session cookie is forwarded by page route loaders/actions when calling the API internally.
- **Mobile/external clients**: Bearer token via `Authorization: Bearer <token>` header. The API layer checks for a bearer token first, then falls back to cookie session, resolving both to the same user profile.

Auth and signup/signin API responses set the session cookie AND return a token in the JSON body so both web and mobile flows are satisfied by the same endpoint.

## Tech Stack

### Frontend
- React Router v7 (framework mode using loaders and actions)
- Programmatic routes (`app/routes.ts` with `RouteConfig[]` — NOT file-based)
- TypeScript (strict mode)
- Functional programming patterns (not OOP)
- Tailwind CSS + Flowbite
- Zod validation
- Remix hook forms
- Mobile responsive
- Classic Twitter blue-and-white aesthetic

### Backend
- REST API (`/api/v1/*`) — JSON resource routes
- TypeScript (strict mode)
- Functional programming patterns (not OOP)
- Service layer for business logic
- Zod validation on all API inputs
- Dual auth: cookie sessions (web) + bearer tokens (mobile)

### Database
- PostgreSQL (via Neon)
- `postgres` npm package (camelCase ↔ snake_case mapping)
- Tables: profiles, tweets, likes
- uuidv7 for IDs
- No ORMs — raw parameterized SQL queries only

### Security
- @node-rs/argon2 (password hashing)
- Zod (frontend UX + backend security validation)
- Parameterized SQL queries (no string concatenation)
- Secrets in environment variables only

### Storage
- Cloudinary (profile avatars)

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Run the database migration: `psql $DATABASE_URL < migrations/001-initial-schema.sql`
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`

## Data Structure

**Profile:**
- id (uuidv7)
- username (unique)
- email (unique)
- password_hash (argon2)
- bio (optional, max 160 chars)
- avatar_url (optional, Cloudinary)
- created_at

**Tweet:**
- id (uuidv7)
- profile_id (FK to profiles)
- content (max 140 chars)
- created_at

**Like:**
- tweet_id (FK to tweets)
- profile_id (FK to profiles)
- created_at
- Composite primary key: (tweet_id, profile_id)

## Programmatic Routes

```typescript
// app/routes.ts
const routes: RouteConfig[] = [
  // Public pages
  { path: '/', component: Landing },
  { path: '/signup', component: Signup },
  { path: '/signin', component: Signin },

  // Authenticated pages
  { path: '/feed', component: Feed },
  { path: '/profile/:username', component: Profile },

  // API v1 resource routes (JSON, no component)
  { path: '/api/v1/auth/signup', file: '...' },
  { path: '/api/v1/auth/signin', file: '...' },
  { path: '/api/v1/auth/signout', file: '...' },
  { path: '/api/v1/tweets', file: '...' },
  { path: '/api/v1/tweets/:id', file: '...' },
  { path: '/api/v1/tweets/:id/like', file: '...' },
  { path: '/api/v1/profiles/:username', file: '...' },
];
```

## Route Types Pattern

Each route imports its types from the auto-generated `+types` directory:

```typescript
import type { Route } from "./+types/routename";
export async function loader({ request }: Route.LoaderArgs) { ... }
export async function action({ request }: Route.ActionArgs) { ... }
export default function Component({ loaderData }: Route.ComponentProps) { ... }
```

Run `npx react-router typegen` to regenerate types after changing routes.
