import { v7 as uuidv7 } from "uuid";

import { sql } from "~/utils/db.server";

// ── Types ────────────────────────────────────────────────────

export type TweetRecord = {
  id: string;
  profileId: string;
  content: string;
  createdAt: Date;
  username: string;
  avatarUrl: string | null;
  likeCount: number;
  isLiked: boolean;
};

// ── Public API ───────────────────────────────────────────────

/**
 * Create a new tweet.
 *
 * Returns the inserted tweet row (without join data).
 */
export async function createTweet(profileId: string, content: string) {
  const id = uuidv7();

  const rows = await sql<{ id: string; profileId: string; content: string; createdAt: Date }[]>`
    INSERT INTO tweets (id, profile_id, content)
    VALUES (${id}, ${profileId}, ${content})
    RETURNING id, profile_id, content, created_at
  `;

  return rows[0]!;
}

/**
 * Get the tweet feed — all tweets, newest first, with author info
 * and like metadata for the requesting user.
 */
export async function getFeed(currentUserId: string): Promise<TweetRecord[]> {
  const rows = await sql<TweetRecord[]>`
    SELECT
      t.id,
      t.profile_id,
      t.content,
      t.created_at,
      p.username,
      p.avatar_url,
      COUNT(l.profile_id)::int AS like_count,
      BOOL_OR(l.profile_id = ${currentUserId})::bool AS is_liked
    FROM tweets t
    JOIN profiles p ON p.id = t.profile_id
    LEFT JOIN likes l ON l.tweet_id = t.id
    GROUP BY t.id, t.profile_id, t.content, t.created_at, p.username, p.avatar_url
    ORDER BY t.created_at DESC
    LIMIT 50
  `;

  return rows;
}

/**
 * Delete a tweet. Only the tweet owner can delete their own tweets.
 *
 * Returns true if a row was deleted, false if the tweet was not found
 * or the user is not the owner.
 */
export async function deleteTweet(
  tweetId: string,
  profileId: string,
): Promise<boolean> {
  const rows = await sql`
    DELETE FROM tweets
    WHERE id = ${tweetId} AND profile_id = ${profileId}
    RETURNING id
  `;

  return rows.length > 0;
}

/**
 * Get tweets by a specific user, newest first.
 */
export async function getTweetsByUser(
  userId: string,
  currentUserId: string | null,
): Promise<TweetRecord[]> {
  const rows = await sql<TweetRecord[]>`
    SELECT
      t.id,
      t.profile_id,
      t.content,
      t.created_at,
      p.username,
      p.avatar_url,
      COUNT(l.profile_id)::int AS like_count,
      BOOL_OR(l.profile_id = ${currentUserId ?? ""})::bool AS is_liked
    FROM tweets t
    JOIN profiles p ON p.id = t.profile_id
    LEFT JOIN likes l ON l.tweet_id = t.id
    WHERE t.profile_id = ${userId}
    GROUP BY t.id, t.profile_id, t.content, t.created_at, p.username, p.avatar_url
    ORDER BY t.created_at DESC
    LIMIT 50
  `;

  return rows;
}
