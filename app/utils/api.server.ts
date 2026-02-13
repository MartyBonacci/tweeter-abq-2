/**
 * Internal API fetch helper for page routes.
 *
 * Page routes call the internal REST API via `fetch()` to prove the API
 * contract works. This helper builds the absolute URL and forwards the
 * session cookie so the API layer can authenticate the request.
 *
 * Usage in a page route loader:
 *
 *   const { data, response } = await apiFetch(request, "/api/v1/tweets");
 */

type ApiFetchResult<T> = {
  data: T;
  response: Response;
};

/**
 * Fetch an internal API endpoint, forwarding the request's cookies.
 *
 * @param request - The incoming page route request (used for cookies and base URL)
 * @param path    - The API path, e.g. "/api/v1/tweets"
 * @param init    - Optional fetch init (method, body, headers, etc.)
 * @returns       - The parsed JSON data and the raw Response
 */
export async function apiFetch<T = unknown>(
  request: Request,
  path: string,
  init?: RequestInit,
): Promise<ApiFetchResult<T>> {
  const url = new URL(path, request.url);
  const cookie = request.headers.get("Cookie") ?? "";

  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    // Throw the actual API response so callers can read the error body
    // (e.g. validation issues, "Username already taken", etc.)
    throw response;
  }

  const data = (await response.json()) as T;
  return { data, response };
}

/**
 * Shorthand for POST/PATCH/DELETE to an internal API endpoint.
 * Automatically sets Content-Type to application/json.
 */
export async function apiMutate<T = unknown>(
  request: Request,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
): Promise<ApiFetchResult<T>> {
  return apiFetch<T>(request, path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
