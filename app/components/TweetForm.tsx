import { Form, useNavigation } from "react-router";
import { useState } from "react";

const MAX_CHARS = 140;

/**
 * Compose a new tweet.
 *
 * Client-side character counter for UX, but the real validation happens
 * server-side via Zod in the API route. The form works without JavaScript
 * via progressive enhancement.
 */
export function TweetForm() {
  const [content, setContent] = useState("");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const remaining = MAX_CHARS - content.length;

  return (
    <Form method="post" className="border-b border-tweeter-extra-light bg-tweeter-white p-4">
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        maxLength={MAX_CHARS}
        rows={3}
        className="w-full resize-none rounded-lg border border-tweeter-extra-light p-3 text-lg placeholder:text-tweeter-light-gray focus:border-tweeter-blue focus:outline-none focus:ring-1 focus:ring-tweeter-blue"
      />

      <div className="mt-2 flex items-center justify-between">
        {/* Character counter */}
        <span
          className={`text-sm ${
            remaining < 0
              ? "font-bold text-red-500"
              : remaining < 20
                ? "text-yellow-500"
                : "text-tweeter-gray"
          }`}
        >
          {remaining}
        </span>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || content.length === 0 || remaining < 0}
          className="rounded-full bg-tweeter-blue px-6 py-2 font-bold text-white transition-colors hover:bg-tweeter-dark-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Tweeting..." : "Tweet"}
        </button>
      </div>
    </Form>
  );
}
