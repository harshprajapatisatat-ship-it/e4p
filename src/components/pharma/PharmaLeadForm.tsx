"use client";

import { useId, useState } from "react";
import { Download, Lock } from "lucide-react";

import {
  FormError,
  FormSuccess,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
  type SelectOption,
} from "@/components/forms/FormKit";
import { submitLead } from "@/components/forms/submitLead";
import { COMPANY_SIZES, FOCUS_AREAS } from "@/lib/leadForm";

/**
 * Lead capture for two of the site's three conversions — Book a Free Demo /
 * Contact us, and the free guide. One component serves all three callers
 * because the shape is the same; the field set, the heading, the button label
 * and the confirmation copy differ.
 *
 * Submissions go to /api/forms, which forwards them server-side to the
 * whitelisted `satat_fca.api.contact.submit_form` method in ERPNext. The
 * browser never sees the ERPNext URL, and there is no API key anywhere — the
 * only configuration is `ERP_URL`, read server-side in src/lib/erpnext.ts.
 *
 * The demo and contact variants write a `Contact Enquiry` record; the guide
 * variant writes a `Guide Download`. Which page it came from is carried on the
 * record as `source_url`, which is also what separates this site's leads from
 * the Manufacturing site's in the same ERPNext inbox.
 */

const SIZE_OPTIONS: SelectOption[] = COMPANY_SIZES.map((label) => ({ value: label, label }));
const FOCUS_OPTIONS: SelectOption[] = FOCUS_AREAS.map((label) => ({ value: label, label }));

/**
 * Everything that differs between the three callers. Held as a map rather than
 * chained ternaries — with a third variant the nesting was already the hardest
 * part of this file to read.
 */
const COPY = {
  demo: {
    eyebrow: "Book a free demo",
    intro:
      "Tell us a little about your unit and we'll tailor the session to your process rather than run a generic tour.",
    submit: "Book a Free Demo",
    sending: "Sending…",
    textLabel: "Tell us about your unit",
    textPlaceholder:
      "What you make, how many people run the system today, and what is hardest to prove right now.",
    doneTitle: "Your request is in",
    doneBody:
      "A consultant will reply within one business day with a couple of slots for the session.",
  },
  guide: {
    eyebrow: "Get the free guide",
    intro: "Tell us where to send it and we'll get the guide over to you.",
    submit: "Get the Free Guide",
    sending: "Sending…",
    textLabel: "What is hardest to prove in your process today?",
    textPlaceholder: "Batch traceability, documentation, rejections, audit readiness…",
    doneTitle: "Your request is in",
    doneBody: "",
  },
  contact: {
    eyebrow: "Contact us",
    intro: "We will get back to you as soon as possible.",
    submit: "Send",
    sending: "Sending…",
    textLabel: "Message",
    textPlaceholder: "Tell us about your unit and what you are trying to solve",
    doneTitle: "Thanks, your message is in",
    doneBody:
      "A consultant will get back to you within one business day. If it is urgent, call us on +91 87990 27217.",
  },
} as const;

export default function PharmaLeadForm({
  variant,
  downloadHref,
}: {
  variant: "demo" | "guide" | "contact";
  /**
   * The gated asset handed over once the form is submitted. Omit it and the
   * confirmation says the guide is on its way instead of rendering a download
   * button that would 404 — the caller passes it only when the file is
   * actually in the build.
   */
  downloadHref?: string;
}) {
  const uid = useId();
  const copy = COPY[variant];
  const guide = variant === "guide";

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    focus: "",
    size: "",
    message: "",
    challenge: "",
  });
  // The two dropdowns are custom listboxes, so neither can carry `required` —
  // submit enforces them and this drives the invalid styling.
  const [missing, setMissing] = useState({ focus: false, size: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = (n: string) => `${uid}-${n}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    // Native controls have passed their own validation by now, so only the two
    // listboxes are left to check — and the guide form does not render them.
    if (!guide && (!form.focus || !form.size)) {
      setMissing({ focus: !form.focus, size: !form.size });
      setError("Please complete the highlighted fields.");
      document.getElementById(id(form.focus ? "size" : "focus"))?.focus();
      return;
    }

    setMissing({ focus: false, size: false });
    setError(null);
    setSending(true);

    const result = await submitLead(guide ? "guide" : "contact", form);

    setSending(false);

    if (!result.ok) {
      setError(result.error);
      // Re-flag the two listboxes if the server rejected them.
      setMissing({
        focus: Boolean(result.fieldErrors?.focus),
        size: Boolean(result.fieldErrors?.size),
      });
      return;
    }

    setSent(true);
  }

  if (sent) {
    // The gate opens here. On the guide the whole point of the form is the PDF
    // behind it, so the download IS the confirmation — not a line of copy
    // promising one will arrive by email later.
    if (guide) {
      return (
        <FormSuccess
          title={downloadHref ? "Your guide is ready" : "On its way to your inbox"}
          message={
            downloadHref
              ? "Download the PDF below — the complete manufacturing flow, from materials entering the plant to a finished batch reaching the customer."
              : "We have your details and will email the guide shortly. If it does not land within a few minutes, check spam or promotions."
          }
        >
          {downloadHref && (
            <a
              href={downloadHref}
              download
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-orange px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#d4760a]"
            >
              <Download size={17} strokeWidth={2.3} />
              Download the guide (PDF)
            </a>
          )}
        </FormSuccess>
      );
    }

    return <FormSuccess title={copy.doneTitle} message={copy.doneBody} />;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] border border-line bg-white p-6 sm:p-7">
      <p className="eyebrow" style={{ color: "var(--color-orange)", letterSpacing: "0.18em" }}>
        {copy.eyebrow}
      </p>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
        {guide && downloadHref
          ? "Fill this in and the guide unlocks straight away — the PDF downloads on the next step."
          : copy.intro}
      </p>

      <div className="mt-6 flex flex-col gap-3.5">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <TextField
            id={id("name")}
            name="name"
            label="Full Name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
          <TextField
            id={id("company")}
            name="company"
            label="Company"
            placeholder="Company name"
            value={form.company}
            onChange={handleChange}
            autoComplete="organization"
          />
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <TextField
            id={id("email")}
            name="email"
            type="email"
            label="Work Email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <TextField
            id={id("phone")}
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+91 00000 00000"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
            // The guide form asks for the least it can get away with — the PDF
            // is the trade, and a required phone number costs downloads.
            optional={guide}
          />
        </div>

        {/* Both Selects are required by `submit_form` for a Contact Enquiry, so
            the guide variant cannot render them and the demo/contact ones must. */}
        {!guide && (
          <>
            <SelectField
              id={id("focus")}
              label="What do you want to fix first?"
              value={form.focus}
              onChange={(focus) => {
                setForm((prev) => ({ ...prev, focus }));
                setMissing((prev) => ({ ...prev, focus: false }));
              }}
              options={FOCUS_OPTIONS}
              placeholder="Select the biggest pain point"
              ariaLabel="What do you want to fix first"
              invalid={missing.focus}
            />
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
          </>
        )}

        {/* Contact and demo write `message`; the guide writes `biggest_challenge`.
            Two different Doctype fields, so they are two different state keys. */}
        <TextAreaField
          id={id(guide ? "challenge" : "message")}
          name={guide ? "challenge" : "message"}
          label={copy.textLabel}
          placeholder={copy.textPlaceholder}
          value={guide ? form.challenge : form.message}
          onChange={handleChange}
          rows={3}
          optional
        />

        {error && <FormError message={error} />}

        <SubmitButton label={copy.submit} sendingLabel={copy.sending} sending={sending} />

        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <Lock size={12} strokeWidth={2.2} aria-hidden className="mt-0.5 shrink-0 text-teal" />
          We use your details only to respond to this request. Never sold, never shared.
        </p>
      </div>
    </form>
  );
}
