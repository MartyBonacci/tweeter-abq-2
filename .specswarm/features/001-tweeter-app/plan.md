# Implementation Plan: Complete Tweeter Application

## Execution Strategy

Build bottom-up: scaffold → database → utilities → services → API routes → page routes → root layout → route config. Each layer depends only on the layers below it.

## Implementation Streams

### Stream 1: Foundation (Sequential — must complete first)
- **T001**: Project scaffold — React Router v7 with all dependencies, TypeScript config, Tailwind, .env.example
- **T002**: Database migration — SQL schema for profiles, tweets, likes

### Stream 2: Utility Layer (Parallel after Stream 1)
- **T003**: db.server.ts — postgres client with camelCase transform
- **T004**: session.server.ts — cookie session storage
- **T005**: validation.ts — shared Zod schemas
- **T006**: cloudinary.server.ts — avatar upload helper

### Stream 3: Auth Utilities (After T003, T004)
- **T007**: utils/auth.server.ts — authenticateRequest (bearer + cookie)
- **T008**: services/auth.server.ts — signup, signin, validateToken, hashPassword

### Stream 4: Core Services (Parallel after T003)
- **T009**: services/tweets.server.ts — createTweet, getFeed, deleteTweet
- **T010**: services/likes.server.ts — toggleLike, getLikeCount, isLikedByUser
- **T011**: services/profiles.server.ts — getProfile, updateProfile, uploadAvatar

### Stream 5: API Routes (After services)
- **T012**: API auth routes — signup, signin, signout
- **T013**: API tweet routes — GET feed, POST create, DELETE
- **T014**: API like route — POST toggle
- **T015**: API profile route — GET public, PATCH own

### Stream 6: Page Layer (After API routes)
- **T016**: utils/api.server.ts — internal fetch helper for page routes
- **T017**: Page routes — landing, signup, signin, feed, profile
- **T018**: Root layout — navbar, user loading, Twitter styling

### Stream 7: Route Config (After all routes)
- **T019**: app/routes.ts — programmatic RouteConfig[] with all routes

## Dependencies

```
T001 → T002 → [T003, T004, T005, T006]
T003 + T004 → T007 → T008
T003 → [T009, T010, T011]
T005 + T006 + T008 → [T012, T013, T014, T015]
T012..T015 → T016 → T017 → T018 → T019
```

## Risk Mitigation

- React Router v7 programmatic routes: Follow official docs for `RouteConfig[]` pattern
- Dual auth: Design auth utility to check bearer first, then cookie, returning same user shape
- Internal fetch: Use `new URL(path, request.url)` to build absolute URLs for internal API calls
