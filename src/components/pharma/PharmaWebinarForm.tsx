"use client";

import { useId, useState } from "react";
import { Lock } from "lucide-react";

import {
  FormError,
  FormSuccess,
  SelectField,
  SubmitButton,
  TextField,
  type SelectOption,
} from "@/components/forms/FormKit";
import { submitLead } from "@/components/forms/submitLead";
import { COMPANY_SIZES } from "@/lib/leadForm";
import { ROUTES } from "@/lib/routes";
import type { WebinarSession } from "@/lib/webinarSessions";

/**
 * Webinar registration panel — the site's primary conversion.
 *
 * Submits to /api/forms, which forwards it server-side to the whitelisted
 * `satat_fca.api.contact.submit_form` method in ERPNext and writes a
 * "Microsites Form Submissions" record tagged `Webinar Registration`.
 *
 * `sessions` comes from the `Webinar Session` Doctype via the Server Component
 * that renders this one (src/lib/webinarSessions.ts). They are no longer
 * hardcoded on the page: tick `enabled` in ERPNext and a slot appears here,
 * untick it and it is gone, with no deploy.
 */

const SIZE_OPTIONS: SelectOption[] = COMPANY_SIZES.map((label) => ({ value: label, label }));

const FIELDS = [
  { name: "name", label: "Full Name", type: "text", placeholder: "Full Name", autoComplete: "name" },
  {
    name: "company",
    label: "Company",
    type: "text",
    placeholder: "Company Name",
    autoComplete: "organization",
  },
  {
    name: "email",
    label: "Business Email",
    type: "email",
    placeholder: "you@company.com",
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+91 00000 00000",
    autoComplete: "tel",
  },
] as const;

export default function PharmaWebinarForm({ sessions }: { sessions: readonly WebinarSession[] }) {
  const uid = useId();

  /** Date on the left, time right-aligned in its own column. */
  const sessionOptions: SelectOption[] = sessions.map((slot) => ({
    value: slot.value,
    label: slot.date,
    trailing: slot.time,
  }));

  // Every slot disabled, all in the past, or ERPNext unreachable — there is
  // nothing real to register against, so registration is blocked rather than
  // taking a booking for a session that may not exist. The button stays visible
  // and greyed with the reason in a tooltip, and /contact is offered instead.
  const noSessions = sessions.length === 0;
  const blockedReason = noSessions
    ? "No sessions are scheduled right now. Contact us and we will let you know the next date."
    : undefined;

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    session: "",
    size: "",
  });
  // Both dropdowns are custom listboxes, so neither can carry `required` — the
  // submit handler enforces them and this drives the invalid styling.
  const [missing, setMissing] = useState({ session: false, size: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = (n: string) => `${uid}-${n}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || noSessions) return;

    // The native inputs have already passed their own validation by now, so only
    // the two listboxes are left to check. With no slots on offer the session
    // listbox is not rendered, so it cannot be required.
    const needsSession = !noSessions && !form.session;
    if (needsSession || !form.size) {
      setMissing({ session: needsSession, size: !form.size });
      setError("Please complete the highlighted fields.");
      document.getElementById(id(needsSession ? "session" : "size"))?.focus();
      return;
    }

    setMissing({ session: false, size: false });
    setError(null);
    setSending(true);

    const result = await submitLead("webinar", form);

    setSending(false);

    if (!result.ok) {
      setError(result.error);
      // Re-flag the two listboxes if the server rejected them.
      setMissing({
        session: Boolean(result.fieldErrors?.session),
        size: Boolean(result.fieldErrors?.size),
      });
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ boxShadow: "0 24px 60px -30px rgba(11,31,51,0.35)", borderRadius: 20 }}>
        {/* Reachable only when a real slot was chosen — with none on offer the
            submit button is disabled, so there is no sessionless success case. */}
        <FormSuccess
          title="Your seat is reserved"
          message={`Check your inbox for the joining link for ${form.session}. We will send a reminder 24 hours before the session.`}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border border-line bg-white p-6 sm:p-7"
      style={{ boxShadow: "0 24px 60px -30px rgba(11,31,51,0.35)" }}
    >
      <p className="eyebrow" style={{ color: "var(--color-orange)", letterSpacing: "0.18em" }}>
        Reserve your seat
      </p>
      <p className="mt-2 text-[19px] font-extrabold tracking-tight text-ink">
        Register free — takes 30 seconds
      </p>
      <hr className="my-5 border-0 border-t" style={{ borderColor: "var(--color-line)" }} />

      <div className="flex flex-col gap-3.5">
        {FIELDS.map((f) => (
          <TextField
            key={f.name}
            id={id(f.name)}
            name={f.name}
            type={f.type}
            label={f.label}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            value={form[f.name]}
            onChange={handleChange}
          />
        ))}

        {noSessions ? (
          <p
            id={id("no-sessions")}
            className="rounded-[10px] text-[12.5px] leading-relaxed"
            style={{
              background: "#fff6e8",
              border: "1px solid #f2d5aa",
              color: "#8a5a12",
              padding: "0.65rem 0.85rem",
            }}
          >
            No sessions are scheduled right now, so registration is closed.{" "}
            <a
              href={ROUTES.contact}
              className="font-semibold underline underline-offset-2"
              style={{ color: "#8a5a12" }}
            >
              Contact us
            </a>{" "}
            and we will let you know as soon as the next date is confirmed.
          </p>
        ) : (
          <SelectField
            id={id("session")}
            label="Preferred Session"
            value={form.session}
            onChange={(session) => {
              setForm((prev) => ({ ...prev, session }));
              setMissing((prev) => ({ ...prev, session: false }));
            }}
            options={sessionOptions}
            placeholder="Select a session"
            ariaLabel="Preferred session"
            invalid={missing.session}
          />
        )}

        <SelectField
          id={id("size")}
          label="Company Size"
          value={form.size}
          onChange={(size) => {
            setForm((prev) => ({ ...prev, size }));
            setMissing((prev) => ({ ...prev, size: false }));
          }}
          options={SIZE_OPTIONS}
          placeholder="Select size"
          ariaLabel="Company size"
          invalid={missing.size}
        />

        {error && <FormError message={error} />}

        <SubmitButton
          label="Reserve My Free Seat"
          sendingLabel="Reserving…"
          sending={sending}
          blockedReason={blockedReason}
        />

        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <Lock size={12} strokeWidth={2.2} aria-hidden className="mt-0.5 shrink-0 text-teal" />
          100% free. No card required. Your details stay with Satat Technologies — never sold or
          shared.
        </p>
      </div>
    </form>
  );
}
