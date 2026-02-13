import { hash, verify } from "@node-rs/argon2";
import { v7 as uuidv7 } from "uuid";

import { sql } from "~/utils/db.server";
import type { SignupInput, SigninInput } from "~/utils/validation";

// ── Types ────────────────────────────────────────────────────

export type ProfileRecord = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
};

type AuthResult = {
  profile: ProfileRecord;
  token: string;
};

// ── Public API ───────────────────────────────────────────────

/**
 * Create a new user account.
 *
 * Hashes the password, inserts a profile row, and returns the new
 * profile with a bearer token (the profile ID in this simplified impl).
 *
 * Throws if the username or email is already taken.
 */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const passwordHash = await hashPassword(input.password);
  const id = uuidv7();

  const rows = await sql<ProfileRecord[]>`
    INSERT INTO profiles (id, username, email, password_hash)
    VALUES (${id}, ${input.username}, ${input.email}, ${passwordHash})
    RETURNING id, username, email, bio, avatar_url, created_at
  `;

  const profile = rows[0]!;
  return { profile, token: profile.id };
}

/**
 * Authenticate with email and password.
 *
 * Returns the profile and a bearer token, or throws if credentials
 * are invalid.
 */
export async function signin(input: SigninInput): Promise<AuthResult> {
  const rows = await sql<(ProfileRecord & { passwordHash: string })[]>`
    SELECT id, username, email, bio, avatar_url, created_at, password_hash
    FROM profiles
    WHERE email = ${input.email}
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("Invalid email or password");
  }

  const valid = await verify(row.passwordHash, input.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const { passwordHash: _, ...profile } = row;
  return { profile, token: profile.id };
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Hash a plaintext password with Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}
