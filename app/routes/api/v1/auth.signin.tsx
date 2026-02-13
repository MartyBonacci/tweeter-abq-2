import type { Route } from "./+types/auth.signin";
import { commitSession, getSession } from "~/utils/session.server";
import { signinSchema } from "~/utils/validation";
import * as authService from "~/services/auth.server";

/**
 * POST /api/v1/auth/signin
 *
 * Authenticate with email and password. Returns the profile and a
 * bearer token. Also sets the session cookie for web clients.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const parsed = signinSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const { profile, token } = await authService.signin(parsed.data);

    // Set session cookie for web clients
    const session = await getSession();
    session.set("profileId", profile.id);

    return Response.json(
      { profile, token },
      {
        headers: { "Set-Cookie": await commitSession(session) },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Signin failed";

    return Response.json({ error: message }, { status: 401 });
  }
}
