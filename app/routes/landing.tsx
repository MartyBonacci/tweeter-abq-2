import type { Route } from "./+types/landing";
import { Link } from "react-router";
import { authenticateRequest } from "~/utils/auth.server";
import { redirect } from "react-router";

/**
 * GET /
 *
 * Public landing page. If the user is already signed in, redirect to feed.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticateRequest(request);
  if (user) throw redirect("/feed");
  return {};
}

export default function Landing() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <span className="text-6xl">🐦</span>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
          Welcome to <span className="text-tweeter-blue">Tweeter</span>
        </h1>
        <p className="mt-3 text-lg text-tweeter-gray">
          Share your thoughts in 140 characters or less.
          <br />
          Classic microblogging, back to basics.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="w-full rounded-full bg-tweeter-blue px-8 py-3 text-center font-bold text-white hover:bg-tweeter-dark-blue sm:w-auto"
          >
            Create account
          </Link>
          <Link
            to="/signin"
            className="w-full rounded-full border border-tweeter-blue px-8 py-3 text-center font-bold text-tweeter-blue hover:bg-blue-50 sm:w-auto"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
