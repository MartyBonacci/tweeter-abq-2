import { useFetcher } from "react-router";

type TweetCardProps = {
  tweet: {
    id: string;
    content: string;
    createdAt: string | Date;
    username: string;
    avatarUrl: string | null;
    likeCount: number;
    isLiked: boolean;
  };
  currentUsername: string | null;
};

/**
 * A single tweet in the feed or profile view.
 *
 * Renders the author info, tweet content, timestamp, like button, and
 * (if the current user owns the tweet) a delete button.
 *
 * Uses `useFetcher` for like and delete — these mutations submit to API
 * resource routes without navigating away from the current page.
 * Progressive enhancement: without JavaScript the forms still POST
 * normally, and the API actions redirect back.
 */
export function TweetCard({ tweet, currentUsername }: TweetCardProps) {
  const likeFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const isOwner = currentUsername === tweet.username;
  const timeAgo = formatTimeAgo(new Date(tweet.createdAt));

  // Optimistic UI: show toggled state while the like request is in-flight
  const isLikeSubmitting = likeFetcher.state !== "idle";
  const optimisticIsLiked = isLikeSubmitting ? !tweet.isLiked : tweet.isLiked;
  const optimisticLikeCount = isLikeSubmitting
    ? tweet.likeCount + (tweet.isLiked ? -1 : 1)
    : tweet.likeCount;

  return (
    <article className="border-b border-tweeter-extra-light bg-tweeter-white px-4 py-3 transition-colors hover:bg-gray-50">
      <div className="flex gap-3">
        {/* Avatar */}
        <a href={`/profile/${tweet.username}`} className="shrink-0">
          <img
            src={tweet.avatarUrl ?? `https://ui-avatars.com/api/?name=${tweet.username}&background=1DA1F2&color=fff`}
            alt={tweet.username}
            className="h-12 w-12 rounded-full object-cover"
          />
        </a>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1">
            <a
              href={`/profile/${tweet.username}`}
              className="truncate font-bold text-gray-900 hover:underline"
            >
              @{tweet.username}
            </a>
            <span className="text-tweeter-light-gray">&middot;</span>
            <time className="whitespace-nowrap text-sm text-tweeter-gray">
              {timeAgo}
            </time>
          </div>

          {/* Tweet body */}
          <p className="mt-1 whitespace-pre-wrap break-words text-gray-900">
            {tweet.content}
          </p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-6">
            {/* Like button — fetcher prevents navigation to the API route */}
            <likeFetcher.Form method="post" action={`/api/v1/tweets/${tweet.id}/like`}>
              <button
                type="submit"
                className={`flex items-center gap-1 text-sm transition-colors ${
                  optimisticIsLiked
                    ? "text-red-500"
                    : "text-tweeter-gray hover:text-red-500"
                }`}
              >
                <span>{optimisticIsLiked ? "\u2764\uFE0F" : "\u2661"}</span>
                <span>{optimisticLikeCount > 0 ? optimisticLikeCount : ""}</span>
              </button>
            </likeFetcher.Form>

            {/* Delete button (owner only) — fetcher prevents navigation */}
            {isOwner && (
              <deleteFetcher.Form method="post" action={`/api/v1/tweets/${tweet.id}`}>
                <input type="hidden" name="_method" value="DELETE" />
                <button
                  type="submit"
                  className="text-sm text-tweeter-gray transition-colors hover:text-red-600"
                >
                  {deleteFetcher.state !== "idle" ? "Deleting..." : "Delete"}
                </button>
              </deleteFetcher.Form>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
