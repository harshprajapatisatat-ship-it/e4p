"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  /** Left-aligned primary text. */
  label: string;
  /** Optional right-aligned secondary text, e.g. a session time. */
  trailing?: string;
};

/**
 * The one dropdown used by every form on the site — Preferred Session, Company
 * Size and "What do you want to fix first?" — so all three render identically.
 * It was previously declared inside PharmaWebinarForm; it lives here now that a
 * second form needs it.
 *
 * A native `<select>` cannot be styled to match the text inputs across browsers,
 * and draws each option as a single run of text, so a value cannot be split
 * into a left label and a right-aligned trailing column (date · time). This is
 * a listbox built to the WAI-ARIA combobox pattern instead: focus stays on the
 * trigger and the active option is tracked with `aria-activedescendant`, which
 * keeps keyboard and screen-reader behaviour close to the native control it
 * replaces.
 *
 * There is no `required` attribute to lean on here — the form checks the value
 * on submit, and /api/forms re-validates server-side before ERPNext does it
 * again in Python.
 */
export default function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  fieldStyle,
  invalid = false,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  ariaLabel: string;
  fieldStyle: React.CSSProperties;
  invalid?: boolean;
}) {
  const listId = `${useId()}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ str: "", at: 0 });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // Pointer-down rather than click so the panel closes before the next control
  // takes focus, and so a press on the trigger itself still toggles cleanly.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the active option in view when arrowing past the panel's edge.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setOpen(true);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const commit = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Type-ahead: jump to the first option starting with what was typed.
    if (open && e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current.str = now - typed.current.at > 700 ? e.key : typed.current.str + e.key;
      typed.current.at = now;
      const i = options.findIndex((o) =>
        o.label.toLowerCase().startsWith(typed.current.str.toLowerCase())
      );
      if (i >= 0) setActive(i);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          openList();
          return;
        }
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + step + options.length) % options.length);
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
        if (open) commit(active);
        else openList();
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

  const borderColor = invalid ? "#e0776f" : focused || open ? "var(--color-orange)" : "#d5e3f0";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...fieldStyle,
          borderColor,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        {selected ? (
          <>
            <span className="flex-1 truncate text-ink">{selected.label}</span>
            {selected.trailing && (
              <span className="shrink-0 tabular-nums text-muted">{selected.trailing}</span>
            )}
          </>
        ) : (
          <span className="flex-1 truncate text-muted">{placeholder}</span>
        )}
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
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[228px] list-none overflow-auto rounded-[10px] border bg-white py-1"
          style={{ borderColor: "#d5e3f0", boxShadow: "0 18px 40px -18px rgba(11,31,51,0.3)" }}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                // Keeps focus on the trigger so the blur styling does not flicker.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[0.9rem]"
                style={{
                  background: i === active ? "rgba(247,148,30,0.1)" : "transparent",
                  color: isSelected ? "var(--color-orange)" : "var(--color-ink)",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span className="flex-1">{option.label}</span>
                {option.trailing && (
                  <span className="shrink-0 tabular-nums text-muted">{option.trailing}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
