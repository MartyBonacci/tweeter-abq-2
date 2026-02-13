import { z } from "zod";

// ── Auth schemas ─────────────────────────────────────────────

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Tweet schemas ────────────────────────────────────────────

export const tweetSchema = z.object({
  content: z
    .string()
    .min(1, "Tweet cannot be empty")
    .max(140, "Tweet must be 140 characters or less"),
});

// ── Profile schemas ──────────────────────────────────────────

export const profileEditSchema = z.object({
  bio: z
    .string()
    .max(160, "Bio must be 160 characters or less")
    .optional()
    .or(z.literal("")),
});

// ── Inferred types ───────────────────────────────────────────

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type TweetInput = z.infer<typeof tweetSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
