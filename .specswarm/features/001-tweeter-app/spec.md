# Feature Specification: Complete Tweeter Application

## Summary

Build the complete Tweeter application — a simplified Twitter clone (140-character era, classic blue-and-white aesthetic) with an API-first three-layer architecture. This is a mentor reference implementation that students will study, so code clarity and exemplary patterns are paramount.

## Scope

Greenfield build from scratch (no package.json exists). Deliver a fully functional application including:

1. Project scaffold (React Router v7, TypeScript strict, Tailwind CSS, all dependencies)
2. Database schema (PostgreSQL via Neon)
3. Utility layer (DB client, sessions, auth, cloudinary, API helper, Zod schemas)
4. Service layer (auth, tweets, likes, profiles — pure functions)
5. API routes (`/api/v1/*` — REST endpoints, JSON in/out)
6. Page routes (thin loaders/actions consuming API via fetch)
7. Root layout with navbar, classic Twitter styling
8. Programmatic route config

## Architecture

See README.md for full architecture details. Key rules:
- Three-layer: Page Routes → API Routes → Services → PostgreSQL
- Page routes call API via `fetch()`, never import services
- Services are pure functions, plain data in/out
- Functional programming only, no classes
- TypeScript strict, Zod validation everywhere
- Dual auth: cookie sessions + bearer tokens
- Raw parameterized SQL, no ORMs
- Programmatic routes in `app/routes.ts`

## Features

- User signup and signin (authentication)
- Tweet posting (140 character limit)
- Tweet feed (newest first)
- Delete own tweets
- Like tweets (toggle)
- User profiles (bio, avatar)
- Profile avatar upload (Cloudinary)
- View other user profiles and their tweets

## Non-Functional Requirements

- Mentor reference implementation — prioritize readability
- Progressive enhancement — forms work without JS
- Mobile responsive
- Classic Twitter blue-and-white aesthetic
