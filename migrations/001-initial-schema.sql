-- Tweeter database schema
-- Run with: psql $DATABASE_URL < migrations/001-initial-schema.sql

-- Enable pgcrypto for gen_random_uuid fallback (Neon has this by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Profiles
-- ============================================================

CREATE TABLE profiles (
  id          TEXT PRIMARY KEY,          -- uuidv7, generated in application code
  username    TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  bio         TEXT CHECK (char_length(bio) <= 160),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_email    ON profiles (email);

-- ============================================================
-- Tweets
-- ============================================================

CREATE TABLE tweets (
  id          TEXT PRIMARY KEY,          -- uuidv7, generated in application code
  profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 140),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tweets_profile_id  ON tweets (profile_id);
CREATE INDEX idx_tweets_created_at  ON tweets (created_at DESC);

-- ============================================================
-- Likes
-- ============================================================

CREATE TABLE likes (
  tweet_id    TEXT NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tweet_id, profile_id)
);

CREATE INDEX idx_likes_tweet_id   ON likes (tweet_id);
CREATE INDEX idx_likes_profile_id ON likes (profile_id);
