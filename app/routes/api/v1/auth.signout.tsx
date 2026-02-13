import type { Route } from "./+types/auth.signout";
import { destroySession, getSession } from "~/utils/session.server";

/**
 * POST /api/v1/auth/signout
 *
 * Destroy the session cookie to log the user out.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getSession(request.headers.get("Cookie"));

  return Response.json(
    { success: true },
    {
      headers: { "Set-Cookie": await destroySession(session) },
    },
  );
}
