"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Lock } from "lucide-react";

/**
 * Webinar registration panel, rebuilt from the Manufacturing site's
 * `/erpnext-manufacturing-webinar` hero form so the two sites register a seat
 * the same way — same fields, same order, same labels, same submit and the same
 * privacy note.
 *
 * The two dropdowns are `role="listbox"` comboboxes rather than native
 * `<select>`, as the reference's are: a native select cannot be styled to match
 * the text inputs across browsers, and the reference needed them to line up.
 * That is a real accessibility cost, so the keyboard contract is implemented in
 * full here — arrows, Home/End, Enter/Space, Escape, type-ahead and focus
 * return — rather than left as a div that only responds to a mouse.
 */

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

/** Matches the reference's bands exactly. */
export const COMPANY_SIZES = [
  "1 – 25 employees",
  "26 – 100 employees",
  "101 – 250 employees",
  "251 – 500 employees",
  "500+ employees",
];

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid #d5e3f0",
  borderRadius: 10,
  padding: "0.7rem 1rem",
  fontSize: "0.9rem",
  color: "var(--color-ink)",
  outline: "none",
  transition: "border-color 0.18s",
  fontFamily: "inherit",
};

function Combobox({
  id,
  label,
  name,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ str: "", at: 0 });

  // Click-away and scroll-into-view for the active option.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const pick = (i: number) => {
    onChange(options[i]);
    setOpen(false);
    btn.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Type-ahead: jump to the first option starting with what was typed.
    if (open && e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current.str = now - typed.current.at > 700 ? e.key : typed.current.str + e.key;
      typed.current.at = now;
      const i = options.findIndex((o) =>
        o.toLowerCase().startsWith(typed.current.str.toLowerCase())
      );
      if (i >= 0) setActive(i);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(Math.max(0, options.indexOf(value)));
          return;
        }
        const d = e.key === "ArrowDown" ? 1 : -1;
        setActive((a) => (a + d + options.length) % options.length);
        return;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        return;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) pick(active);
        else {
          setOpen(true);
          setActive(Math.max(0, options.indexOf(value)));
        }
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12.5px] font-semibold text-ink">
        {label}
      </label>
      <div ref={wrap} className="relative">
        {/* Carries the value into FormData, since the control is not a native
            form element. `required` lives here so the browser's own validation
            still blocks an empty submit. */}
        <input
          type="text"
          name={name}
          value={value}
          required
          readOnly
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onFocus={() => btn.current?.focus()}
        />
        <button
          ref={btn}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => {
            setOpen((o) => !o);
            setActive(Math.max(0, options.indexOf(value)));
          }}
          onKeyDown={onKeyDown}
          style={{
            ...INPUT_STYLE,
            borderColor: open ? "var(--color-orange)" : "#d5e3f0",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span className={`flex-1 truncate ${value ? "text-ink" : "text-muted"}`}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2.2}
            aria-hidden
            className="shrink-0 text-muted transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </button>

        {open && (
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[228px] list-none overflow-auto rounded-[10px] border bg-white py-1"
            style={{ borderColor: "#d5e3f0", boxShadow: "0 18px 40px -18px rgba(11,31,51,0.3)" }}
          >
            {options.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(i)}
                className="cursor-pointer px-4 py-2.5 text-[0.9rem]"
                style={{
                  background: i === active ? "rgba(247,148,30,0.1)" : "transparent",
                  color: o === value ? "var(--color-orange)" : "var(--color-ink)",
                  fontWeight: o === value ? 600 : 400,
                }}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PharmaWebinarForm({
  sessions,
  action,
}: {
  /** Session labels for the "Preferred Session" dropdown. */
  sessions: string[];
  /** Real submission endpoint. Omit and the form runs in preview mode. */
  action?: string;
}) {
  const uid = useId();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [session, setSession] = useState("");
  const [size, setSize] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("sending");
    const body = new FormData(e.currentTarget);
    try {
      if (action) await fetch(action, { method: "POST", body });
    } finally {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div
        className="rounded-[20px] border border-line bg-white p-7 text-center"
        style={{ boxShadow: "0 24px 60px -30px rgba(11,31,51,0.35)" }}
        role="status"
        aria-live="polite"
      >
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--state-released-bg)" }}
        >
          <CheckCircle2 size={24} strokeWidth={2.2} style={{ color: "var(--state-released)" }} />
        </span>
        <p className="mt-4 text-[18px] font-extrabold tracking-tight text-ink">
          {action ? "Your seat is reserved" : "Your registration is ready to send"}
        </p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">
          {action
            ? `We'll email the joining link for ${session || "your session"} shortly.`
            : "This build has no form endpoint connected yet, so nothing was transmitted. Pass an `action` to PharmaWebinarForm to send it to your CRM."}
        </p>
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
        {FIELDS.map((f) => {
          const id = `${uid}-${f.name}`;
          return (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-[12.5px] font-semibold text-ink">
                {f.label}
              </label>
              <input
                id={id}
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                required
                style={INPUT_STYLE}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-orange)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d5e3f0")}
              />
            </div>
          );
        })}

        <Combobox
          id={`${uid}-session`}
          name="session"
          label="Preferred Session"
          placeholder="Select a session"
          options={sessions}
          value={session}
          onChange={setSession}
        />
        <Combobox
          id={`${uid}-size`}
          name="companySize"
          label="Company Size"
          placeholder="Select size"
          options={COMPANY_SIZES}
          value={size}
          onChange={setSize}
        />

        <button
          type="submit"
          disabled={state !== "idle"}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-[10px] px-8 py-4 text-[15.5px] font-bold text-white transition-colors disabled:opacity-70"
          style={{
            background: "var(--color-orange)",
            cursor: state === "idle" ? "pointer" : "default",
            letterSpacing: "0.02em",
          }}
        >
          {state === "sending" && <Loader2 size={17} strokeWidth={2.4} className="animate-spin" />}
          {state === "sending" ? "Reserving…" : "Reserve My Free Seat"}
        </button>

        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <Lock size={12} strokeWidth={2.2} aria-hidden className="mt-0.5 shrink-0 text-teal" />
          100% free. No card required. Your details stay with Satat Technologies — never sold or
          shared.
        </p>
      </div>
    </form>
  );
}
