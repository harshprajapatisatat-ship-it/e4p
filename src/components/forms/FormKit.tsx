"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Shared form primitives for the site's lead forms. They exist so every form
 * renders identical controls instead of each file re-declaring the same input
 * styling — the webinar panel and the contact/guide panel had two copies of the
 * same skin before.
 *
 * `FormSelect` is re-exported rather than copied: ONE definition of the listbox,
 * used by every dropdown on the site.
 */
import FormSelect, { type SelectOption } from "./FormSelect";

export { default as FormSelect } from "./FormSelect";
export type { SelectOption } from "./FormSelect";

/** The one input skin used by every form control on the site. */
export const fieldStyle: React.CSSProperties = {
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

const BORDER_IDLE = "#d5e3f0";
const BORDER_INVALID = "#e0776f";

/**
 * Border colour is driven from React state rather than `:focus` CSS because the
 * control is styled inline — and because an invalid field has to stay red while
 * focused instead of turning orange.
 */
function useFieldBorder(invalid: boolean) {
  const [focused, setFocused] = useState(false);
  return {
    borderColor: invalid ? BORDER_INVALID : focused ? "var(--color-orange)" : BORDER_IDLE,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
}

export function FieldLabel({
  htmlFor,
  label,
  optional,
}: {
  htmlFor: string;
  label: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-ink">
      {label}
      {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
    </label>
  );
}

type BaseFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  /** Fields are required by default — pass `optional` to relax it. */
  optional?: boolean;
  invalid?: boolean;
  autoComplete?: string;
};

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  optional = false,
  invalid = false,
  autoComplete,
}: BaseFieldProps & {
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { borderColor, onFocus, onBlur } = useFieldBorder(invalid);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} label={label} optional={optional} />
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={!optional}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        style={{ ...fieldStyle, borderColor }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  optional = false,
  invalid = false,
}: BaseFieldProps & {
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const { borderColor, onFocus, onBlur } = useFieldBorder(invalid);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} label={label} optional={optional} />
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={!optional}
        aria-invalid={invalid || undefined}
        style={{ ...fieldStyle, borderColor, resize: "vertical", minHeight: 96 }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

/**
 * A labelled dropdown row — the label markup that every FormSelect needs, so
 * the three call sites do not each repeat it.
 */
export function SelectField({
  id,
  label,
  ...select
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  ariaLabel: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} label={label} />
      <FormSelect id={id} fieldStyle={fieldStyle} {...select} />
    </div>
  );
}

/** Inline validation banner, shared by every form. */
export function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-[10px] text-[12.5px] leading-relaxed"
      style={{
        background: "#fdecea",
        border: "1px solid #f5c6c2",
        color: "#b3261e",
        padding: "0.65rem 0.85rem",
      }}
    >
      {message}
    </p>
  );
}

/**
 * Orange submit button, with a sending state and a blocked state.
 *
 * `blockedReason` greys the button out and puts the reason in a tooltip rather
 * than hiding the button — the visitor can still see what the form is for and
 * why they cannot use it yet, which an absent button does not tell them. It is
 * also mirrored into `aria-describedby` text by the caller where the reason
 * needs to be readable without a hover.
 */
export function SubmitButton({
  label,
  sendingLabel,
  sending,
  blockedReason,
}: {
  label: string;
  sendingLabel: string;
  sending: boolean;
  /** Non-empty disables the button and becomes its tooltip. */
  blockedReason?: string;
}) {
  const blocked = Boolean(blockedReason);
  const inert = blocked || sending;

  return (
    <button
      type="submit"
      disabled={inert}
      title={blockedReason}
      aria-disabled={inert || undefined}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-[10px] px-8 py-4 text-[15.5px] font-bold transition-colors"
      style={{
        background: blocked ? "#e4ebf2" : sending ? "#5a6b7b" : "var(--color-orange)",
        color: blocked ? "#8a9bab" : "#fff",
        border: blocked ? "1px solid #d5e3f0" : "1px solid transparent",
        cursor: inert ? "not-allowed" : "pointer",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        if (!inert) e.currentTarget.style.background = "#d4760a";
      }}
      onMouseLeave={(e) => {
        if (!inert) e.currentTarget.style.background = "var(--color-orange)";
      }}
    >
      {sending && <Loader2 size={17} strokeWidth={2.4} className="animate-spin" />}
      {sending ? sendingLabel : label}
    </button>
  );
}

/**
 * Confirmation panel shown in place of a submitted form.
 *
 * `children` is for anything that has to follow the message — on the guide form
 * that is the download button, which is the entire point of the gate.
 */
export function FormSuccess({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[20px] border border-line bg-white p-7 text-center"
    >
      <span
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--state-released-bg)" }}
      >
        <CheckCircle2 size={24} strokeWidth={2.2} style={{ color: "var(--state-released)" }} />
      </span>
      <p className="mt-4 text-[18px] font-extrabold tracking-tight text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">{message}</p>
      {children}
    </div>
  );
}
