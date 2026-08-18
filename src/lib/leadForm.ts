/**
 * The contract shared by every lead form on this microsite and the route
 * handler behind them (src/app/api/forms/route.ts).
 *
 * All three forms — contact enquiry, webinar registration, guide download —
 * write to ONE ERPNext Doctype, "Microsites Form Submissions", through one
 * whitelisted method. `form_type` on the record says which form it came from
 * and `source_url` says which page, so the fields below are the union of all
 * three forms with nothing repeated.
 *
 * The same method and the same Doctype also serve the Manufacturing microsite.
 * The two are told apart on the record by `source_url`, which carries the full
 * pharma URL — so adding this site needed no new endpoint and no new Doctype.
 *
 * This module is imported by both Client Components and the server route, so it
 * must stay free of secrets and of any server-only import.
 */

/**
 * Whitelisted, guest-callable writer in the `satat_fca` Frappe app
 * (satat_fca/api/contact.py). It creates the "Microsites Form Submissions"
 * record with `ignore_permissions`; no Doctype permission is involved, and no
 * API key exists anywhere in this codebase.
 */
export const SUBMIT_METHOD = "satat_fca.api.contact.submit_form";

/**
 * Which of the three site forms a submission came from. These exact strings are
 * what `submit_form` expects as `form_type` — Python maps them to the Doctype's
 * Select labels itself ("Contact Enquiry" / "Webinar Registration" /
 * "Guide Download"), so that wording lives in one place, server-side.
 */
export type FormType = "contact" | "webinar" | "guide";

/**
 * Which webinar this site sells seats to.
 *
 * Two different webinars run off the one `Webinar Session` Doctype — the
 * Manufacturing microsite's and this one — so every read and every registration
 * names its track. Without it both sites would advertise the same dates and a
 * pharma visitor could be booked onto a manufacturing session.
 *
 * Must match an option on the Doctype's `webinar_type` Select exactly;
 * `get_webinar_sessions` throws on a value it does not recognise rather than
 * quietly returning every track.
 */
export const WEBINAR_TYPE = "Pharma";

/**
 * The one company-size list, shared by the contact and webinar forms and by the
 * Doctype's `company_size` Select.
 *
 * These strings must match the Doctype's Select options CHARACTER FOR CHARACTER
 * — `submit_form` allowlists them against `frappe.get_meta(...)`, so a curly
 * dash or a stray space is rejected with an opaque 417. Plain hyphens, as in
 * the Doctype.
 */
export const COMPANY_SIZES = [
  "1 - 25 employees",
  "26 - 100 employees",
  "101 - 250 employees",
  "251 - 500 employees",
  "500+ employees",
] as const;

/**
 * "What do you want to fix first?" on the contact form.
 *
 * Same reasoning as COMPANY_SIZES: every value here has to exist as an option
 * on the Doctype's `focus_area` Select. This list is deliberately identical to
 * the Manufacturing site's, because both sites feed the one Select — the plant
 * problems below all read true for a pharmaceutical unit. To add a pharma-only
 * option ("Batch traceability and recall readiness", say), add it to the
 * Doctype Select FIRST, then here.
 */
export const FOCUS_AREAS = [
  "Production planning and delivery dates",
  "Inventory accuracy and stock-outs",
  "Procurement and vendor follow-up",
  "Quality checks and rejections",
  "Costing and plant profitability",
  "A full ERPNext implementation",
  "Support for an existing ERPNext setup",
  "Something else",
] as const;

/** What the browser POSTs to /api/forms. Every field is optional but `formType`. */
export type LeadPayload = {
  formType: FormType;
  /** Full URL of the page the form was submitted from — attribution only. */
  sourceUrl?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  /** Contact form: "What do you want to fix first?" */
  focus?: string;
  /** Contact + webinar: company size. */
  size?: string;
  /** Webinar: the chosen session slot, e.g. "21 Aug 2026 4:00 PM". */
  session?: string;
  /** Contact form: "Tell us about your unit". */
  message?: string;
  /** Guide form: "What is hardest to prove in your process today?" */
  challenge?: string;
};

/** Client-field keys a validation error can be reported against. */
export type LeadFieldErrors = Partial<
  Record<"name" | "company" | "email" | "phone" | "focus" | "size" | "session", string>
>;

/** What /api/forms answers with. */
export type LeadResponse =
  | { ok: true; name: string }
  | { ok: false; error: string; fieldErrors?: LeadFieldErrors };
