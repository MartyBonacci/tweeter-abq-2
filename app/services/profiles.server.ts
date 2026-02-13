import { sql } from "~/utils/db.server";
import { uploadAvatar } from "~/utils/cloudinary.server";

// ── Types ────────────────────────────────────────────────────

export type ProfileRecord = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
};

// ── Public API ───────────────────────────────────────────────

/**
 * Get a user's public profile by username.
 *
 * Returns the profile or null if not found.
 */
export async function getProfile(
  username: string,
): Promise<ProfileRecord | null> {
  const rows = await sql<ProfileRecord[]>`
    SELECT id, username, email, bio, avatar_url, created_at
    FROM profiles
    WHERE username = ${username}
  `;

  return rows[0] ?? null;
}

/**
 * Update a user's profile (bio and/or avatar).
 *
 * If an avatar File is provided, it's uploaded to Cloudinary first.
 * Returns the updated profile.
 */
export async function updateProfile(
  profileId: string,
  updates: { bio?: string; avatarFile?: File | null },
): Promise<ProfileRecord> {
  let avatarUrl: string | undefined;

  if (updates.avatarFile && updates.avatarFile.size > 0) {
    avatarUrl = await uploadAvatar(updates.avatarFile);
  }

  const rows = await sql<ProfileRecord[]>`
    UPDATE profiles
    SET
      bio = COALESCE(${updates.bio ?? null}, bio),
      avatar_url = COALESCE(${avatarUrl ?? null}, avatar_url)
    WHERE id = ${profileId}
    RETURNING id, username, email, bio, avatar_url, created_at
  `;

  return rows[0]!;
}
