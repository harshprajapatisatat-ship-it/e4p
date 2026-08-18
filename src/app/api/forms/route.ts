import type { NextRequest } from "next/server";

import { callMethod, ErpNextError } from "@/lib/erpnext";
import {
  COMPANY_SIZES,
  FOCUS_AREAS,
  SUBMIT_METHOD,
  WEBINAR_TYPE,
  type FormType,
  type LeadFieldErrors,
} from "@/lib/leadForm";
import { getWebinarSessions } from "@/lib/webinarSessions";

/** Frappe/ERPNext needs Node APIs — never run this on the edge runtime. */
export const runtime = "nodejs";

/** Roomy enough for the two free-text fields, still far short of an abuse vector. */
const MAX_BODY_BYTES = 12_000;
const MAX_TEXT_LEN = 2_000;
const MAX_URL_LEN = 500;

const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Which optional-by-default fields each form actually requires. The three forms
 * share one endpoint and one Doctype, but not one set of required fields — the
 * guide form asks for the least, the webinar form for the most.
 *
 * This mirrors `REQUIRED_BY_FORM` in satat_fca/api/contact.py exactly. Python is
 * the authority; this copy exists so a visitor gets a field-level error in the
 * browser instead of one opaque banner from Frappe.
 */
const REQUIRED: Record<
  FormType,
  { phone: boolean; size: boolean; focus: boolean; session: boolean }
> = {
  contact: { phone: true, size: true, focus: true, session: false },
  webinar: { phone: true, size: true, focus: false, session: true },
  guide: { phone: false, size: false, focus: false, session: false },
};

/**
 * Best-effort, per-instance throttle. Serverless instances do not share memory,
 * so this blunts casual spam rather than acting as a hard guarantee — the real
 * ceiling is `@rate_limit(limit=8, seconds=600)` on `submit_form`.
 */
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5_000) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }

  return false;
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Pragmatic shape check — real deliverability is verified by the follow-up email. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Attribution, not input: a junk value is dropped rather than failing the
 * submission, because losing the lead would cost more than losing the URL.
 */
function cleanSourceUrl(raw: string): string {
  if (!raw || raw.length > MAX_URL_LEN) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function validate(
  formType: FormType,
  payload: Record<string, unknown>,
  /** Session values currently on offer, straight from ERPNext. */
  sessionValues: readonly string[]
) {
  const required = REQUIRED[formType];

  const fields = {
    name: asString(payload.name),
    company: asString(payload.company),
    email: asString(payload.email),
    phone: asString(payload.phone),
    focus: asString(payload.focus),
    size: asString(payload.size),
    session: asString(payload.session),
    message: asString(payload.message).slice(0, MAX_TEXT_LEN),
    challenge: asString(payload.challenge).slice(0, MAX_TEXT_LEN),
  };

  const errors: LeadFieldErrors = {};

  if (fields.name.length < 2 || fields.name.length > 140) {
    errors.name = "Please enter your full name.";
  }
  if (fields.company.length < 2 || fields.company.length > 140) {
    errors.company = "Please enter your company name.";
  }
  if (!EMAIL_RE.test(fields.email) || fields.email.length > 140) {
    errors.email = "Please enter a valid business email address.";
  }

  // Phone is optional on the guide form, so only shape-check what was sent.
  if (required.phone || fields.phone) {
    const digits = fields.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15 || fields.phone.length > 30) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  // The three Select values are allowlisted rather than length-checked: each one
  // must match a Doctype option exactly or ERPNext rejects the whole document.
  if (required.size && !fields.size) {
    errors.size = "Please select your company size.";
  } else if (
    fields.size &&
    !COMPANY_SIZES.includes(fields.size as (typeof COMPANY_SIZES)[number])
  ) {
    errors.size = "Please select your company size.";
  }

  if (required.focus && !fields.focus) {
    errors.focus = "Please choose what you want to fix first.";
  } else if (fields.focus && !FOCUS_AREAS.includes(fields.focus as (typeof FOCUS_AREAS)[number])) {
    errors.focus = "Please choose what you want to fix first.";
  }

  // With nothing scheduled the form hides the dropdown entirely, so a webinar
  // submission with no session is valid — we still want the lead. Otherwise the
  // value has to be one currently on offer.
  if (required.session && sessionValues.length > 0 && !sessionValues.includes(fields.session)) {
    errors.session = "Please choose one of the available sessions.";
  }

  return { fields, errors };
}

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isFormType(value: unknown): value is FormType {
  return typeof value === "string" && value in REQUIRED;
}

/** Frappe stores "" as an empty string; drop blanks so unused fields read as null. */
function compact(doc: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== ""));
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    if (isRateLimited(clientKey(request))) {
      return json(
        { ok: false, error: "Too many attempts. Please try again in a few minutes." },
        429
      );
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "Request payload is too large." }, 413);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      return json({ ok: false, error: "Malformed request body." }, 400);
    }

    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return json({ ok: false, error: "Malformed request body." }, 400);
    }

    const body = payload as Record<string, unknown>;
    if (!isFormType(body.formType)) {
      return json({ ok: false, error: "Unknown form." }, 400);
    }
    const formType = body.formType;

    // Only the webinar form needs the slot list, and it must be uncached: a slot
    // disabled a minute ago must not still be registerable.
    const sessionValues =
      formType === "webinar" ? (await getWebinarSessions(0)).map((slot) => slot.value) : [];

    const { fields, errors } = validate(formType, body, sessionValues);
    if (Object.keys(errors).length > 0) {
      return json(
        {
          ok: false,
          error: "Please check the highlighted fields and try again.",
          fieldErrors: errors,
        },
        400
      );
    }

    const created = await callMethod<{ ok: boolean; name: string }>(SUBMIT_METHOD, {
      params: compact({
        form_type: formType,
        source_url: cleanSourceUrl(asString(body.sourceUrl)),
        full_name: fields.name,
        company: fields.company,
        email: fields.email.toLowerCase(),
        phone: fields.phone,
        company_size: fields.size,
        focus_area: fields.focus,
        preferred_session: fields.session,
        // Scopes Python's session allowlist to this site's track, so a pharma
        // registration cannot be booked onto a manufacturing slot. `compact()`
        // drops it again on the two non-webinar forms.
        webinar_type: formType === "webinar" ? WEBINAR_TYPE : "",
        message: fields.message,
        biggest_challenge: fields.challenge,
      }),
    });

    return json({ ok: true, name: created.name }, 201);
  } catch (error) {
    if (error instanceof ErpNextError) {
      // Full upstream detail stays in the server log; the client gets a safe message.
      console.error("[api/forms] ERPNext request failed", {
        status: error.status,
        message: error.message,
        detail: error.detail,
      });

      // 401/403 (missing allow_guest) and 500 (unset ERP_URL) are operator
      // problems — never surface those details to a visitor.
      const clientMessage =
        error.status === 417 || error.status === 400
          ? "We could not save your details. Please review your entries and try again."
          : "We could not send this right now. Please try again shortly.";

      return json({ ok: false, error: clientMessage }, error.status === 417 ? 400 : 502);
    }

    console.error("[api/forms] Unhandled error", error);
    return json({ ok: false, error: "Something went wrong. Please try again shortly." }, 500);
  }
}
