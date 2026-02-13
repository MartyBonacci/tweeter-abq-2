import { Link, useFetcher } from "react-router";
import { useEffect } from "react";

type NavbarProps = {
  user: {
    username: string;
    avatarUrl: string | null;
  } | null;
};

/**
 * Top navigation bar.
 *
 * Shows the Tweeter logo, and either sign in/up links (for guests) or
 * the user's avatar with feed/profile/sign out links (for authenticated users).
 *
 * Sign out uses `useFetcher` to POST to the API route without navigating
 * to it. On success, we redirect to the landing page via `window.location`
 * to clear all client state.
 */
export function Navbar({ user }: NavbarProps) {
  const signoutFetcher = useFetcher();

  // Redirect to landing page after signout completes
  useEffect(() => {
    if (signoutFetcher.state === "idle" && signoutFetcher.data) {
      window.location.href = "/";
    }
  }, [signoutFetcher.state, signoutFetcher.data]);

  return (
    <nav className="sticky top-0 z-50 border-b border-tweeter-extra-light bg-tweeter-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link to={user ? "/feed" : "/"} className="flex items-center gap-2">
          <span className="text-2xl">{"\uD83D\uDC26"}</span>
          <span className="text-xl font-bold text-tweeter-blue">Tweeter</span>
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/feed"
              className="text-sm font-medium text-tweeter-gray hover:text-tweeter-blue"
            >
              Feed
            </Link>
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-2"
            >
              <img
                src={user.avatarUrl ?? `https://ui-avatars.com/api/?name=${user.username}&background=1DA1F2&color=fff&size=32`}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden text-sm font-medium text-gray-900 sm:inline">
                @{user.username}
              </span>
            </Link>
            {/* useFetcher prevents navigation to the API route */}
            <signoutFetcher.Form method="post" action="/api/v1/auth/signout">
              <button
                type="submit"
                className="text-sm text-tweeter-gray hover:text-red-500"
              >
                Sign out
              </button>
            </signoutFetcher.Form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="text-sm font-medium text-tweeter-gray hover:text-tweeter-blue"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-tweeter-blue px-4 py-1.5 text-sm font-bold text-white hover:bg-tweeter-dark-blue"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
