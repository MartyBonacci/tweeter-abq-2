import { type RouteConfig, route, index } from "@react-router/dev/routes";

/**
 * Programmatic route configuration.
 *
 * All routes are defined here explicitly — NOT using file-based routing.
 * This gives us full control over URL patterns and route-to-file mapping.
 *
 * Route types are auto-generated into the +types directory. Run
 * `npx react-router typegen` after modifying this file.
 */
export default [
  // ── Public pages ────────────────────────────────────────────
  index("routes/landing.tsx"),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),

  // ── Authenticated pages ────────────────────────────────────
  route("feed", "routes/feed.tsx"),
  route("profile/:username", "routes/profile.$username.tsx"),

  // ── API v1: Auth ───────────────────────────────────────────
  route("api/v1/auth/signup", "routes/api/v1/auth.signup.tsx"),
  route("api/v1/auth/signin", "routes/api/v1/auth.signin.tsx"),
  route("api/v1/auth/signout", "routes/api/v1/auth.signout.tsx"),

  // ── API v1: Tweets ─────────────────────────────────────────
  route("api/v1/tweets", "routes/api/v1/tweets.tsx"),
  route("api/v1/tweets/:id", "routes/api/v1/tweets.$id.tsx"),
  route("api/v1/tweets/:id/like", "routes/api/v1/tweets.$id.like.tsx"),

  // ── API v1: Profiles ───────────────────────────────────────
  route("api/v1/profiles/:username", "routes/api/v1/profiles.$username.tsx"),
] satisfies RouteConfig;
