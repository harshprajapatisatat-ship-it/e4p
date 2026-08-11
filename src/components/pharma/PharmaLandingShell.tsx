"use client";

import { CheckCircle2, ExternalLink, CalendarCheck, BookOpen } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import PharmaLeadForm from "./PharmaLeadForm";
import { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * Shared shell for the two conversion pages (/contact#demo and the guide).
 *
 * Same hero treatment as the home page — 104px top padding to clear the fixed
 * header, the brand radial wash, the 1320px container — with the copy on the
 * left and the form on the right so the form is above the fold on desktop.
 */

/**
 * The eyebrow icon is chosen here rather than passed in: the two callers are
 * Server Components, and a component reference (a function) cannot cross the
 * server/client boundary as a prop. `variant` already distinguishes them.
 */
const EYEBROW_ICON = { demo: CalendarCheck, guide: BookOpen } as const;

export default function PharmaLandingShell({
  eyebrow,
  title,
  accent,
  lede,
  points,
  pointsLabel,
  variant,
  showScheduleMLink = false,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  points: string[];
  pointsLabel: string;
  variant: "demo" | "guide";
  showScheduleMLink?: boolean;
}) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.07, duration: 0.8 });
  const EyebrowIcon = EYEBROW_ICON[variant];

  return (
    <main className="relative isolate overflow-hidden bg-white pb-20 pt-[104px] lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 10% 0%, rgba(247,148,30,0.08), transparent 70%), radial-gradient(55% 45% at 92% 8%, rgba(0,68,124,0.07), transparent 72%)",
        }}
      />

      <div ref={ref} className="mx-auto w-full max-w-[1320px] px-5 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,0.85fr)] lg:gap-16">
          <div data-reveal>
            <p
              className="eyebrow inline-flex items-center gap-2 rounded-pill border border-orange/25 bg-orange/8 px-4 py-1.5"
              style={{ color: "var(--color-orange)", letterSpacing: "0.16em" }}
            >
              <EyebrowIcon size={14} strokeWidth={2.4} />
              {eyebrow}
            </p>

            <h1 className="display-lg mt-5 text-balance text-ink">
              {title} <span className="text-orange">{accent}</span>
            </h1>

            <p
              className="mt-5 text-balance leading-relaxed text-muted"
              style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)", maxWidth: "56ch" }}
            >
              {lede}
            </p>

            <p
              className="eyebrow mt-9"
              style={{ letterSpacing: "0.18em" }}
            >
              {pointsLabel}
            </p>
            <ul className="mt-4 flex max-w-[54ch] list-none flex-col gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink">
                  <CheckCircle2
                    size={16}
                    strokeWidth={2.2}
                    className="mt-[3px] shrink-0 text-teal-deep"
                  />
                  {p}
                </li>
              ))}
            </ul>

            {showScheduleMLink && (
              <a
                href={ROUTES.scheduleM}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy underline decoration-navy/25 underline-offset-4 transition-colors hover:text-orange hover:decoration-orange/50"
              >
                {CTA_LABELS.scheduleM}
                <ExternalLink size={14} strokeWidth={2.3} />
              </a>
            )}
          </div>

          <div data-reveal className="lg:sticky lg:top-[96px]">
            <PharmaLeadForm variant={variant} />
          </div>
        </div>
      </div>
    </main>
  );
}
