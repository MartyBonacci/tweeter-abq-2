import type { Route } from "./+types/auth.signup";
import { commitSession, getSession } from "~/utils/session.server";
import { signupSchema } from "~/utils/validation";
import * as authService from "~/services/auth.server";

/**
 * POST /api/v1/auth/signup
 *
 * Create a new user account. Returns the profile and a bearer token.
 * Also sets the session cookie so the web client is logged in immediately.
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const { profile, token } = await authService.signup(parsed.data);

    // Set session cookie for web clients
    const session = await getSession();
    session.set("profileId", profile.id);

    return Response.json(
      { profile, token },
      {
        status: 201,
        headers: { "Set-Cookie": await commitSession(session) },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Signup failed";

    // Check for unique constraint violations
    if (message.includes("unique") || message.includes("duplicate")) {
      return Response.json(
        { error: "Username or email already taken" },
        { status: 409 },
      );
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
