/**
 * Server-only ERPNext (Frappe) client.
 *
 * `ERP_URL` is the ONLY configuration this needs. The site calls whitelisted
 * methods in the `satat_fca` app (satat_fca/api/contact.py), which are declared
 * `allow_guest=True` and insert with `ignore_permissions`. That means:
 *
 *   - no API key or secret is involved anywhere;
 *   - Guest holds NO permission on any Doctype, so nothing can be read or
 *     written except through the specific functions those methods expose;
 *   - all validation and rate limiting live server-side, in Python.
 *
 * Still server-only: requests should go through the route handler in
 * src/app/api/forms/route.ts rather than straight from a Client Component.
 */

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/erpnext.ts is server-only, import it only from Route Handlers or Server Components."
  );
}

const REQUEST_TIMEOUT_MS = 10_000;

/** Error carrying an HTTP status that is safe to hand back to the caller. */
export class ErpNextError extends Error {
  readonly status: number;
  /** Raw upstream payload — for server logs only, never sent to the client. */
  readonly detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ErpNextError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Read at request time, not module load, so a missing variable surfaces as a
 * handled 500 instead of crashing the build.
 */
function readBaseUrl(): string {
  const baseUrl = process.env.ERP_URL?.trim();

  if (!baseUrl) {
    throw new ErpNextError("ERPNext is not configured, missing ERP_URL", 500);
  }

  // Tolerate a trailing slash in ERP_URL so paths never double up.
  return baseUrl.replace(/\/+$/, "");
}

/**
 * Frappe reports `frappe.throw()` messages in `_server_messages`: a JSON string
 * whose entries are themselves JSON strings. Dig out the first readable line —
 * this is what surfaces the Python validation errors.
 */
function extractFrappeMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const body = payload as Record<string, unknown>;

  if (typeof body._server_messages === "string") {
    try {
      const entries: unknown = JSON.parse(body._server_messages);
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (typeof entry !== "string") continue;
          let text = entry;
          try {
            const parsed: unknown = JSON.parse(entry);
            if (parsed && typeof parsed === "object" && "message" in parsed) {
              const inner = (parsed as { message?: unknown }).message;
              if (typeof inner === "string") text = inner;
            }
          } catch {
            // entry was a bare string, not nested JSON — use it as-is
          }
          // Frappe embeds HTML in these messages.
          const clean = text.replace(/<[^>]*>/g, "").trim();
          if (clean) return clean;
        }
      }
    } catch {
      // malformed _server_messages — fall through to the other fields
    }
  }

  for (const key of ["message", "exception", "exc_type"] as const) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Non-JSON body: an HTML error page, a proxy/WAF block, a maintenance page.
    return text.slice(0, 500);
  }
}

/**
 * Call a whitelisted method — `POST/GET /api/method/:dotted.path`.
 *
 * Use GET for reads: Next's data cache only applies to GET, so `revalidate`
 * is meaningless on a POST. Writes must be POST.
 *
 * @returns the method's return value (Frappe wraps it in `message`).
 * @throws {ErpNextError} for transport failures, timeouts, and upstream errors.
 */
export async function callMethod<T>(
  method: string,
  options: {
    params?: Record<string, unknown>;
    httpMethod?: "GET" | "POST";
    /** Seconds the response may be cached. GET only; 0 disables caching. */
    revalidate?: number;
  } = {}
): Promise<T> {
  const { params = {}, httpMethod = "POST", revalidate = 0 } = options;
  const baseUrl = readBaseUrl();

  let endpoint = `${baseUrl}/api/method/${method}`;
  let body: string | undefined;

  if (httpMethod === "GET") {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) query.set(key, String(value));
    }
    const qs = query.toString();
    if (qs) endpoint += `?${qs}`;
  } else {
    body = JSON.stringify(params);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: httpMethod,
      // No Authorization header: these methods are `allow_guest=True`.
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(httpMethod === "GET" && revalidate > 0
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";
    throw new ErpNextError(
      timedOut
        ? `ERPNext did not respond within ${REQUEST_TIMEOUT_MS}ms`
        : "Could not reach ERPNext",
      504,
      cause
    );
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const upstream = extractFrappeMessage(payload);
    throw new ErpNextError(
      upstream ?? `ERPNext responded with HTTP ${response.status}`,
      response.status,
      payload
    );
  }

  const result = (payload as { message?: unknown } | undefined)?.message;
  if (result === undefined) {
    throw new ErpNextError(
      "ERPNext returned an unexpected response shape",
      502,
      payload
    );
  }

  return result as T;
}
