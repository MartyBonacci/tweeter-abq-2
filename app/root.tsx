import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { Navbar } from "~/components/Navbar";
import { authenticateRequest } from "~/utils/auth.server";
import stylesheet from "./app.css?url";

// ── Links ────────────────────────────────────────────────────

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "stylesheet", href: stylesheet },
];

// ── Loader ───────────────────────────────────────────────────

/**
 * Root loader — resolves the optional current user for the navbar.
 * This runs on every page load, so authentication is available globally.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticateRequest(request);
  return { user };
}

// ── Layout ───────────────────────────────────────────────────

/**
 * Root HTML layout — wraps every page in the app.
 *
 * This component is a stable shell that doesn't unmount between navigations.
 * It provides the <html>, <head>, and <body> structure.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-tweeter-bg">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ── App ──────────────────────────────────────────────────────

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Navbar user={loaderData.user} />
      <Outlet />
    </>
  );
}

// ── Error Boundary ───────────────────────────────────────────

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : String(error.status);
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">{message}</h1>
        <p className="mt-2 text-tweeter-gray">{details}</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-full bg-tweeter-blue px-6 py-2 font-bold text-white hover:bg-tweeter-dark-blue"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
