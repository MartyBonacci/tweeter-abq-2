# Tech Stack

## Project Info

- **Project**: Tweeter
- **Updated**: 2026-02-12
- **Auto-detected**: No (greenfield — derived from README spec)

## Core Technologies

### Framework
- **React Router v7** (framework mode)
  - Loaders and actions for server-first data flow
  - Programmatic routes via `RouteConfig[]` in `app/routes.ts`
  - Route types from `+types` auto-generation (`npx react-router typegen`)

### Language
- **TypeScript** (strict mode)
  - Zod-inferred types preferred over manual interfaces
  - No `any` types

### Build Tool
- **Vite** (via React Router v7)

### Styling
- **Tailwind CSS** + **Flowbite**
  - Classic Twitter blue-and-white aesthetic
  - Mobile responsive

### Database
- **PostgreSQL** via **Neon** (serverless)
  - `postgres` npm package with camelCase ↔ snake_case transform
  - Raw parameterized SQL only — no ORMs
  - uuidv7 for all IDs

### Validation
- **Zod** — frontend (UX) and backend (security)
- **Remix Hook Forms** — form management with Zod integration
- Shared schemas in `app/utils/validation.ts`

### Authentication
- **@node-rs/argon2** — password hashing
- **createCookieSessionStorage** — web sessions
- Bearer tokens — mobile/external clients
- Auth utility in `app/utils/auth.server.ts`

### Storage
- **Cloudinary** — profile avatar uploads

## Testing

### Unit & Integration
- **Vitest**

### End-to-End
- **Playwright**

## Approved Libraries

### Already Specified
- `postgres` (PostgreSQL client)
- `zod` (validation)
- `@node-rs/argon2` (password hashing)
- `tailwindcss` + `flowbite` / `flowbite-react` (styling)
- `cloudinary` (image uploads)
- `uuid` / uuidv7 generation

### General Purpose
- `date-fns` (date manipulation, if needed)

## Prohibited Patterns

### Architecture
- No classes or OOP patterns — functional programming only
- No ORMs (Prisma, Drizzle, etc.) — raw parameterized SQL only
- No file-based routing — programmatic routes in `app/routes.ts`
- No direct DB access in page routes — must go through API layer via `fetch()`
- No `useEffect` for data fetching — use loaders
- No client-side fetch for mutations — use actions

### Libraries
- No Redux, MobX, or Zustand — server-first state via loaders
- No Moment.js — use `date-fns` if needed
- No PropTypes — TypeScript handles type checking
- No class components — functional components only

### Security
- No string concatenation in SQL — parameterized queries only
- No secrets in code — environment variables only
- No `any` types in TypeScript

## Notes

- Created by `/specswarm:init` from README specification
- This is a greenfield project — no `package.json` exists yet
- Update this file as dependencies are added during development
