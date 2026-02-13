import type { Route } from "./+types/tweets";
import { requireAuth } from "~/utils/auth.server";
import { tweetSchema } from "~/utils/validation";
import * as tweetService from "~/services/tweets.server";

/**
 * GET /api/v1/tweets
 *
 * Return the tweet feed (newest first) for the authenticated user.
 * Includes like counts and whether the current user has liked each tweet.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  const tweets = await tweetService.getFeed(user.id);

  return Response.json({ tweets, user });
}

/**
 * POST /api/v1/tweets
 *
 * Create a new tweet (140 character max).
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireAuth(request);
  const body = await request.json();
  const parsed = tweetSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tweet = await tweetService.createTweet(user.id, parsed.data.content);
  return Response.json({ tweet }, { status: 201 });
}
