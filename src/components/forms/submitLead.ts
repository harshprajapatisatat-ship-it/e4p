"use client";

import type { FormType, LeadFieldErrors, LeadPayload, LeadResponse } from "@/lib/leadForm";

/**
 * POSTs a lead form to our own API route, which forwards it to ERPNext
 * server-side — the browser never sees the ERPNext URL or credentials.
 *
 * Every form on the site goes through here so that attribution (`sourceUrl`),
 * network-error copy and the response shape are identical across all three
 * instead of each form re-implementing them.
 */
export async function submitLead(
  formType: FormType,
  fields: Omit<LeadPayload, "formType" | "sourceUrl">
): Promise<{ ok: true } | { ok: false; error: string; fieldErrors?: LeadFieldErrors }> {
  try {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        formType,
        // Which page the visitor actually submitted from — the query string is
        // kept so campaign parameters survive onto the ERPNext record.
        sourceUrl: window.location.href,
      } satisfies LeadPayload),
    });

    const data = (await res.json().catch(() => ({}))) as Partial<LeadResponse>;

    if (!res.ok || !data.ok) {
      const failure = data as Extract<LeadResponse, { ok: false }>;
      return {
        ok: false,
        error: failure.error ?? "We could not send this. Please try again.",
        fieldErrors: failure.fieldErrors,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Network error, please check your connection and try again.",
    };
  }
}
