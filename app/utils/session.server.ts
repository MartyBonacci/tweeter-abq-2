import { createCookieSessionStorage } from "react-router";

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is not set. Add it to your .env file or Vercel environment variables.",
  );
}

/**
 * Cookie-based session storage for web authentication.
 *
 * The session stores the authenticated user's profile ID.
 * API routes read this via `authenticateRequest()` in auth.server.ts.
 */
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__tweeter_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
