import type { Route } from "./+types/signin";
import { Form, redirect } from "react-router";
import { apiMutate } from "~/utils/api.server";

/**
 * GET /signin — Render the signin form.
 * POST /signin — Submit signin via the internal API.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const { response } = await apiMutate(request, "/api/v1/auth/signin", "POST", {
      email,
      password,
    });

    // Forward the Set-Cookie header from the API response
    const setCookie = response.headers.get("Set-Cookie");
    return redirect("/feed", {
      headers: setCookie ? { "Set-Cookie": setCookie } : {},
    });
  } catch (error) {
    if (error instanceof Response) {
      const body = await error.json().catch(() => null);
      return { error: body?.error ?? "Invalid email or password" };
    }
    return { error: "Something went wrong" };
  }
}

export default function Signin({ actionData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Sign in to Tweeter
        </h1>

        {actionData?.error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-tweeter-extra-light px-3 py-2 focus:border-tweeter-blue focus:outline-none focus:ring-1 focus:ring-tweeter-blue"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-tweeter-extra-light px-3 py-2 focus:border-tweeter-blue focus:outline-none focus:ring-1 focus:ring-tweeter-blue"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-tweeter-blue py-2.5 font-bold text-white hover:bg-tweeter-dark-blue"
          >
            Sign in
          </button>
        </Form>

        <p className="mt-4 text-center text-sm text-tweeter-gray">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-tweeter-blue hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
