/**
 * Server-only reader for the `Webinar Session` Doctype.
 *
 * The webinar page used to carry its dates as a hardcoded array in the page
 * file. They now live in ERPNext so the team can add, move or retire a slot
 * without a deploy: tick `enabled` and it appears on the site, untick it and it
 * is gone.
 *
 * Two filters decide what the site shows, and both are applied in Python
 * (see `_enabled_sessions` in satat_fca/api/contact.py):
 *   1. `enabled = 1`   — the manual switch.
 *   2. date >= today   — past sessions drop off on their own, so nobody has to
 *                        remember to disable last month's slot.
 */

import { callMethod } from "./erpnext";
import { WEBINAR_TYPE } from "./leadForm";

/** Whitelisted, guest-callable reader in the `satat_fca` app. */
const SESSIONS_METHOD = "satat_fca.api.contact.get_webinar_sessions";

/**
 * A bookable slot, as the page renders it.
 *
 * `value` is the string stored on the submission record, and it must match what
 * Python's `_format_session` builds — `submit_form` allowlists the submitted
 * session against that list, so a different separator here (a `·`, say) would
 * be rejected as "not one of the available sessions".
 */
export type WebinarSession = {
  /** `"21 Aug 2026"` */
  date: string;
  /** `"4:00 PM"` */
  time: string;
  /** `"21 Aug 2026 4:00 PM"` — the value stored on the submission record. */
  value: string;
};

/**
 * How long a rendered page may serve a cached slot list.
 *
 * Zero in development: Next caches `fetch` by this value in dev too, which
 * means toggling a slot in ERPNext appears to do nothing for five minutes.
 * Locally you always want to see what ERPNext actually says.
 */
export const SESSION_REVALIDATE_SECONDS =
  process.env.NODE_ENV === "development" ? 0 : 300;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type SessionRow = { session_date: string; session_time: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** `"2026-08-21"` -> `"21 Aug 2026"`, matching Frappe's `dd MMM yyyy`. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${pad(day)} ${MONTHS[month - 1]} ${year}`;
}

/** `"16:00:00"` -> `"4:00 PM"`, matching Frappe's `h:mm a`. */
function formatTime(isoTime: string): string {
  const [hours, minutes] = isoTime.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
}

function toSession(row: SessionRow): WebinarSession {
  const date = formatDate(row.session_date);
  const time = formatTime(row.session_time);
  return { date, time, value: `${date} ${time}` };
}

/**
 * Every slot the site should currently offer, soonest first.
 *
 * @param revalidate seconds the result may be cached for. Pages use the default;
 *   the submission route passes 0 so a slot disabled a minute ago cannot still
 *   be registered against.
 */
export async function getWebinarSessions(
  revalidate: number = SESSION_REVALIDATE_SECONDS
): Promise<WebinarSession[]> {
  try {
    // The enabled/not-past/track filtering all happens in Python — see
    // get_webinar_sessions. Without `webinar_type` this would return the
    // Manufacturing site's slots as well.
    const rows = await callMethod<SessionRow[]>(SESSIONS_METHOD, {
      httpMethod: "GET",
      params: { webinar_type: WEBINAR_TYPE },
      revalidate,
    });
    return rows.map(toSession);
  } catch (error) {
    // Never let an ERPNext problem take the landing page down with it — but do
    // not invent dates either. There is no hardcoded fallback list: a slot the
    // site cannot confirm against ERPNext must not be offered, because someone
    // would register for a session that may not exist. The page renders its
    // "no dates scheduled" state instead, with registration disabled.
    console.error("[webinarSessions] ERPNext unreachable, offering no slots", error);
    return [];
  }
}
