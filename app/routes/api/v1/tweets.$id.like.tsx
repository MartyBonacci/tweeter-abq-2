import type { Route } from "./+types/tweets.$id.like";
import { requireAuth } from "~/utils/auth.server";
import * as likeService from "~/services/likes.server";

/**
 * POST /api/v1/tweets/:id/like
 *
 * Toggle a like on a tweet. If already liked, unlike it; if not liked,
 * like it. Returns the new like state and total count.
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireAuth(request);
  const result = await likeService.toggleLike(params.id, user.id);

  return Response.json(result);
}
