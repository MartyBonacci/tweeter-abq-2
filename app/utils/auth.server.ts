import { sql } from "./db.server";
import { getSession } from "./session.server";

/**
 * Profile shape returned by authentication.
 * This is the "current user" object available to all authenticated routes.
 */
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
};

/**
 * Authenticate an incoming request.
 *
 * Checks for a bearer token first (mobile/external clients), then falls
 * back to the cookie session (web clients). Both resolve to the same
 * AuthUser shape.
 *
 * Returns the authenticated user or null if no valid credentials are found.
 */
export async function authenticateRequest(
  request: Request,
): Promise<AuthUser | null> {
  // 1. Check for bearer token (mobile/external clients)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return getUserByToken(token);
  }

  // 2. Fall back to cookie session (web clients)
  const session = await getSession(request.headers.get("Cookie"));
  const profileId = session.get("profileId") as string | undefined;
  if (!profileId) return null;

  return getUserById(profileId);
}

/**
 * Require authentication — throws a 401 Response if not authenticated.
 * Use this in API routes that require a logged-in user.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await authenticateRequest(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

// ── Internal helpers ─────────────────────────────────────────

async function getUserById(id: string): Promise<AuthUser | null> {
  const rows = await sql<AuthUser[]>`
    SELECT id, username, email, bio, avatar_url
    FROM profiles
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

async function getUserByToken(token: string): Promise<AuthUser | null> {
  // Bearer tokens are profile IDs in this simplified implementation.
  // In production, you'd use JWTs or opaque tokens with a tokens table.
  return getUserById(token);
}
