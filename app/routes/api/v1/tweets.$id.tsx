import type { Route } from "./+types/tweets.$id";
import { requireAuth } from "~/utils/auth.server";
import * as tweetService from "~/services/tweets.server";

/**
 * DELETE /api/v1/tweets/:id
 *
 * Delete a tweet. Only the tweet owner can delete their own tweets.
 *
 * Accepts both:
 *  - Native DELETE requests (from JS-enhanced fetchers)
 *  - POST with `_method=DELETE` (progressive enhancement — HTML forms
 *    only support GET/POST, so a hidden field carries the intent)
 */
export async function action({ request, params }: Route.ActionArgs) {
  const isDelete =
    request.method === "DELETE" ||
    (request.method === "POST" &&
      (await request.clone().formData()).get("_method") === "DELETE");

  if (!isDelete) {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireAuth(request);
  const deleted = await tweetService.deleteTweet(params.id, user.id);

  if (!deleted) {
    return Response.json(
      { error: "Tweet not found or not authorized" },
      { status: 404 },
    );
  }

  return Response.json({ success: true });
}
