import { sql } from "~/utils/db.server";

// ── Public API ───────────────────────────────────────────────

/**
 * Toggle a like on a tweet.
 *
 * If the user has already liked the tweet, the like is removed.
 * If the user has not liked the tweet, a like is added.
 *
 * Returns the new like state and count.
 */
export async function toggleLike(
  tweetId: string,
  profileId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = await sql`
    SELECT 1 FROM likes
    WHERE tweet_id = ${tweetId} AND profile_id = ${profileId}
  `;

  if (existing.length > 0) {
    // Unlike
    await sql`
      DELETE FROM likes
      WHERE tweet_id = ${tweetId} AND profile_id = ${profileId}
    `;
  } else {
    // Like
    await sql`
      INSERT INTO likes (tweet_id, profile_id)
      VALUES (${tweetId}, ${profileId})
    `;
  }

  const likeCount = await getLikeCount(tweetId);
  return { liked: existing.length === 0, likeCount };
}

/**
 * Get the total like count for a tweet.
 */
export async function getLikeCount(tweetId: string): Promise<number> {
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM likes
    WHERE tweet_id = ${tweetId}
  `;

  return rows[0]?.count ?? 0;
}

/**
 * Check if a user has liked a specific tweet.
 */
export async function isLikedByUser(
  tweetId: string,
  profileId: string,
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM likes
    WHERE tweet_id = ${tweetId} AND profile_id = ${profileId}
  `;

  return rows.length > 0;
}
