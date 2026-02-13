import type { Route } from "./+types/feed";
import { redirect } from "react-router";
import { apiFetch, apiMutate } from "~/utils/api.server";
import { TweetCard } from "~/components/TweetCard";
import { TweetForm } from "~/components/TweetForm";

/**
 * Shape of the JSON returned by GET /api/v1/tweets.
 * Defined locally so this page route never imports from services.
 */
type FeedData = {
  tweets: {
    id: string;
    content: string;
    createdAt: string;
    username: string;
    avatarUrl: string | null;
    likeCount: number;
    isLiked: boolean;
  }[];
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

/**
 * GET /feed — Load the tweet timeline for the authenticated user.
 */
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { data } = await apiFetch<FeedData>(request, "/api/v1/tweets");
    return data;
  } catch {
    throw redirect("/signin");
  }
}

/**
 * POST /feed — Create a new tweet via the internal API.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const content = String(formData.get("content") ?? "");

  await apiMutate(request, "/api/v1/tweets", "POST", { content });
  return redirect("/feed");
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  const { tweets, user } = loaderData;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Compose */}
      <TweetForm />

      {/* Feed */}
      {tweets.length === 0 ? (
        <div className="p-8 text-center text-tweeter-gray">
          <p className="text-lg">No tweets yet!</p>
          <p className="mt-1 text-sm">Be the first to tweet something.</p>
        </div>
      ) : (
        <div>
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              currentUsername={user.username}
            />
          ))}
        </div>
      )}
    </main>
  );
}
