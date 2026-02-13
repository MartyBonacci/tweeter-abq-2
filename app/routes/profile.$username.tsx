import type { Route } from "./+types/profile.$username";
import { Form } from "react-router";
import { apiFetch } from "~/utils/api.server";
import { TweetCard } from "~/components/TweetCard";

/**
 * Shape of the JSON returned by GET /api/v1/profiles/:username.
 * Defined locally so this page route never imports from services.
 */
type ProfileData = {
  profile: {
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  tweets: {
    id: string;
    content: string;
    createdAt: string;
    username: string;
    avatarUrl: string | null;
    likeCount: number;
    isLiked: boolean;
  }[];
  currentUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
};

/**
 * GET /profile/:username — Load a user's profile and their tweets.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const { data } = await apiFetch<ProfileData>(
    request,
    `/api/v1/profiles/${params.username}`,
  );
  return data;
}

/**
 * POST /profile/:username — Update own profile (bio/avatar) via API.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const cookie = request.headers.get("Cookie") ?? "";
  const url = new URL(`/api/v1/profiles/${params.username}`, request.url);

  const response = await fetch(url, {
    method: "PATCH",
    headers: { Cookie: cookie },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { error: body?.error ?? "Update failed" };
  }

  return { success: true };
}

export default function Profile({ loaderData, actionData }: Route.ComponentProps) {
  const { profile, tweets, currentUser } = loaderData;
  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Profile header */}
      <header className="border-b border-tweeter-extra-light bg-tweeter-white p-6">
        <div className="flex items-start gap-4">
          <img
            src={profile.avatarUrl ?? `https://ui-avatars.com/api/?name=${profile.username}&background=1DA1F2&color=fff&size=96`}
            alt={profile.username}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              @{profile.username}
            </h1>
            {profile.bio && (
              <p className="mt-1 text-tweeter-gray">{profile.bio}</p>
            )}
            <p className="mt-2 text-sm text-tweeter-light-gray">
              {tweets.length} tweet{tweets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Edit profile form (own profile only) */}
        {isOwnProfile && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-tweeter-blue hover:underline">
              Edit profile
            </summary>

            {actionData?.error && (
              <div className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {actionData.error}
              </div>
            )}
            {actionData?.success && (
              <div className="mt-2 rounded-lg bg-green-50 p-2 text-sm text-green-600">
                Profile updated!
              </div>
            )}

            <Form method="post" encType="multipart/form-data" className="mt-3 space-y-3">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  maxLength={160}
                  rows={2}
                  defaultValue={profile.bio ?? ""}
                  className="mt-1 block w-full rounded-lg border border-tweeter-extra-light px-3 py-2 focus:border-tweeter-blue focus:outline-none focus:ring-1 focus:ring-tweeter-blue"
                  placeholder="Tell us about yourself (160 chars max)"
                />
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-tweeter-gray file:mr-3 file:rounded-full file:border-0 file:bg-tweeter-blue file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-tweeter-dark-blue"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-tweeter-blue px-6 py-2 text-sm font-bold text-white hover:bg-tweeter-dark-blue"
              >
                Save changes
              </button>
            </Form>
          </details>
        )}
      </header>

      {/* Tweets */}
      {tweets.length === 0 ? (
        <div className="p-8 text-center text-tweeter-gray">
          <p>No tweets yet.</p>
        </div>
      ) : (
        <div>
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              currentUsername={currentUser?.username ?? null}
            />
          ))}
        </div>
      )}
    </main>
  );
}
