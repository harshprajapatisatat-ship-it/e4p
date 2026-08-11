"use client";

import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Lead capture for the site's two conversions — Book a Free Demo and the free
 * guide. One component serves both because the fields are the same; only the
 * heading, the button label and the confirmation copy differ.
 *
 * There is no backend on this build. `onSubmit` validates, shows the pending
 * state and then the confirmation, and POSTs to `action` only if one is passed —
 * wire it to the real endpoint (Frappe/ERPNext Lead, HubSpot, whatever the CRM
 * is) by passing `action`. It deliberately does not silently pretend to have
 * sent anything: with no `action`, the confirmation says the details are ready
 * to send rather than claiming they were.
 */

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  full?: boolean;
};

const FIELDS: Field[] = [
  { name: "name", label: "Full name", required: true, placeholder: "Your name" },
  { name: "company", label: "Company", required: true, placeholder: "Company name" },
  { name: "email", label: "Work email", type: "email", required: true, placeholder: "you@company.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+91" },
  {
    name: "message",
    label: "What is hardest to prove in your process today?",
    placeholder: "Optional — the more specific, the more useful the session",
    full: true,
  },
];

export default function PharmaLeadForm({
  variant,
  action,
}: {
  variant: "demo" | "guide";
  /** Real submission endpoint. Omit and the form runs in preview mode. */
  action?: string;
}) {
  const uid = useId();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const demo = variant === "demo";
  const submitLabel = demo ? "Book a Free Demo" : "Get the Free Guide";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("sending");
    const body = new FormData(e.currentTarget);
    try {
      if (action) {
        await fetch(action, { method: "POST", body });
      }
    } finally {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div
        className="rounded-[20px] border border-line bg-white p-7 text-center"
        role="status"
        aria-live="polite"
      >
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--state-released-bg)" }}
        >
          <CheckCircle2
            size={24}
            strokeWidth={2.2}
            style={{ color: "var(--state-released)" }}
          />
        </span>
        <p className="mt-4 text-[18px] font-extrabold tracking-tight text-ink">
          {demo ? "Your details are ready to send" : "Your request is ready to send"}
        </p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">
          {action
            ? "Thanks — we have your details and will be in touch within one working day."
            : "This build has no form endpoint connected yet, so nothing was transmitted. Pass an `action` to PharmaLeadForm to send it to your CRM."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border border-line bg-white p-6 sm:p-7"
      noValidate={false}
    >
      <p className="eyebrow" style={{ color: "var(--color-orange)", letterSpacing: "0.18em" }}>
        {demo ? "Book a free demo" : "Get the free guide"}
      </p>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
        {demo
          ? "Tell us a little about your unit and we'll tailor the session to your process rather than run a generic tour."
          : "Tell us where to send it. We'll also point you at the official Schedule M source so you can read it first-hand."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const id = `${uid}-${f.name}`;
          const isArea = f.name === "message";
          return (
            <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
                {f.label}
                {f.required && (
                  <span className="ml-1 text-orange" aria-hidden>
                    *
                  </span>
                )}
              </label>
              {isArea ? (
                <textarea
                  id={id}
                  name={f.name}
                  rows={3}
                  placeholder={f.placeholder}
                  className="mt-1.5 w-full resize-y rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-orange"
                />
              ) : (
                <input
                  id={id}
                  name={f.name}
                  type={f.type ?? "text"}
                  required={f.required}
                  placeholder={f.placeholder}
                  autoComplete={
                    f.name === "email"
                      ? "email"
                      : f.name === "phone"
                        ? "tel"
                        : f.name === "name"
                          ? "name"
                          : f.name === "company"
                            ? "organization"
                            : "off"
                  }
                  className="mt-1.5 w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-orange"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-orange px-8 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[#d4760a] disabled:opacity-70"
      >
        {state === "sending" ? (
          <>
            <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
            Sending
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight size={18} strokeWidth={2.4} />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[12px] leading-relaxed text-muted">
        We use your details only to respond to this request.
      </p>
    </form>
  );
}
