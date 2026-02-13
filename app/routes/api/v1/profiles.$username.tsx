import type { Route } from "./+types/profiles.$username";
import { authenticateRequest, requireAuth } from "~/utils/auth.server";
import { profileEditSchema } from "~/utils/validation";
import * as profileService from "~/services/profiles.server";
import * as tweetService from "~/services/tweets.server";

/**
 * GET /api/v1/profiles/:username
 *
 * Return a user's public profile and their tweets.
 * Authentication is optional — unauthenticated users can view profiles
 * but won't see like state.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await authenticateRequest(request);
  const profile = await profileService.getProfile(params.username);

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const tweets = await tweetService.getTweetsByUser(
    profile.id,
    currentUser?.id ?? null,
  );

  return Response.json({ profile, tweets, currentUser });
}

/**
 * PATCH /api/v1/profiles/:username
 *
 * Update own profile (bio and/or avatar). Only the profile owner can
 * update their own profile. Accepts multipart form data for avatar upload.
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PATCH") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireAuth(request);

  // Only allow updating your own profile
  if (params.username !== user.username && params.username !== "me") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("Content-Type") ?? "";

  let bio: string | undefined;
  let avatarFile: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    bio = (formData.get("bio") as string) ?? undefined;
    avatarFile = formData.get("avatar") as File | null;
  } else {
    const body = await request.json();
    const parsed = profileEditSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    bio = parsed.data.bio ?? undefined;
  }

  const profile = await profileService.updateProfile(user.id, {
    bio,
    avatarFile,
  });

  return Response.json({ profile });
}
