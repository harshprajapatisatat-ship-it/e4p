"use client";

import Link from "next/link";

// Re-exported so client sections can keep a single import. Server Components
// must import these from "@/lib/routes" directly — see the note in that file.
export { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * Shared primitives for the ERPNext-for-Pharma site.
 *
 * These are deliberately the same components, with the same props and the same
 * rendered classes, as `mfg/MfgUI.tsx` + `webinar/WebinarUI.tsx` on the
 * Manufacturing site. Section rhythm, container width, heading scale, button
 * shape and hover behaviour are therefore identical across both surfaces — the
 * pharma character comes from the content and the diagrams, not from a
 * different design system.
 */

/**
 * Section wrapper.
 *
 * The inner container mirrors the header bar's own container —
 * `max-w-[1320px] px-5 lg:px-8` (see Header.tsx) — so every section lines up
 * with the logo and the nav rather than sitting on a narrower grid. Vertical
 * rhythm stays on the site-wide `clamp(4rem,8vw,7rem)`.
 */
export function SectionShell({
  id,
  tone = "white",
  background,
  children,
}: {
  id?: string;
  tone?: "white" | "surface";
  /**
   * Optional full-bleed layer painted behind the container, edge to edge
   * rather than inside the 1320px grid. Positioning is only switched on when
   * something is passed, so sections without a background keep whatever
   * containing block their absolute children resolve against today.
   */
  background?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        background: tone === "surface" ? "var(--color-surface)" : "#fff",
        padding: "clamp(4rem,8vw,7rem) 0",
        ...(background ? { position: "relative", overflow: "hidden" } : null),
      }}
    >
      {background}
      <div
        className={`mx-auto w-full max-w-[1320px] px-5 lg:px-8 ${background ? "relative" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Section heading — eyebrow + clamped 800-weight h2 with an orange accent span
 * + optional lede. `tone="dark"` recolours it for the two navy sections
 * (Schedule M, ERPNext solution) without changing any of the type metrics.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  desc,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  desc?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div
      data-reveal
      className={centered ? "mx-auto text-center" : "text-left"}
      style={{ maxWidth: centered ? 820 : undefined }}
    >
      <p
        className="eyebrow tracking-[0.22em]"
        style={{ color: dark ? "var(--color-orange-soft)" : "var(--color-orange)" }}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance ${dark ? "text-white" : "text-ink"}`}
        style={{
          fontSize: "clamp(1.9rem,3.6vw,3.2rem)",
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: "-0.025em",
        }}
      >
        {title}{" "}
        {accent && (
          <span style={{ color: dark ? "var(--color-orange-soft)" : "var(--color-orange)" }}>
            {accent}
          </span>
        )}
      </h2>
      {desc && (
        <p
          className={`mt-4 leading-relaxed ${dark ? "text-white/72" : "text-muted"} ${
            centered ? "mx-auto" : ""
          }`}
          style={{ fontSize: "clamp(0.9rem,1.1vw,1.05rem)", maxWidth: "62ch" }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

type ButtonProps = {
  href: string;
  label: string;
  size?: "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
  /** Set for the CDSCO link so it opens in a new tab. */
  external?: boolean;
};

const SIZES = {
  md: "px-6 py-3.5 text-[15px]",
  lg: "px-8 py-4 text-[16px]",
} as const;

/** Primary CTA — the orange button used site-wide. */
export function PrimaryButton({
  href,
  label,
  size = "md",
  className = "",
  icon,
  external,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-[10px] bg-orange font-semibold text-white transition-colors hover:bg-[#d4760a] ${SIZES[size]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {label}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
      {icon}
    </Link>
  );
}

/** Secondary CTA — white/bordered ghost button. */
export function SecondaryButton({
  href,
  label,
  size = "md",
  className = "",
  icon,
  external,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-[10px] border border-line bg-white font-semibold text-ink transition-colors hover:border-orange hover:text-orange ${SIZES[size]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {label}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
      {icon}
    </Link>
  );
}

/** Secondary CTA sitting on one of the navy sections. */
export function SecondaryButtonDark({
  href,
  label,
  size = "md",
  className = "",
  icon,
  external,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/8 font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/14 ${SIZES[size]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {label}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
      {icon}
    </Link>
  );
}

/**
 * Small uppercase label with a leading state dot. Used on every diagram to name
 * a batch/lot state in the shared compliance semantics (see globals.css).
 */
export function StateChip({
  label,
  state = "controlled",
  className = "",
}: {
  label: string;
  state?: "released" | "quarantine" | "rejected" | "controlled";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] ${className}`}
      style={{
        color: `var(--state-${state})`,
        background: `var(--state-${state}-bg)`,
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: `var(--state-${state})` }}
      />
      {label}
    </span>
  );
}
