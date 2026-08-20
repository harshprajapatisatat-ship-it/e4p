"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { ROUTES, CTA_LABELS, CONTACT } from "@/lib/routes";

/**
 * Footer for the ERPNext-for-Pharma site.
 *
 * Composition follows the prebuiltui "footer-1" pattern — one centred brand
 * block (logo, then a single tagline capped at `max-w-xl`), a wrapping row of
 * links, then a hairline-divided bottom bar — but rendered in the Satat palette
 * instead of that design's purple gradient. The reference's dark band is
 * deliberately NOT carried over: `/satat-logo.svg` draws its wordmark in navy
 * (#003E80), which disappears on a dark navy field, and a white knock-out
 * variant of the mark does not exist. The vertical gradient survives as a warm
 * white → surface → orange-wash descent, so the footer still reads as its own
 * band without breaking the white site or the single-asset logo.
 *
 * This replaced a 5-column, 21-link footer. The link row below is that nav
 * distilled to one destination per section — see the LINKS note.
 */

type FooterLink = { label: string; href: string; external?: boolean };

/**
 * One centred, wrapping row instead of four columns: who we are → what you can
 * take away → what you should know → how to reach us.
 *
 * "Join Webinar" was removed from this row when the webinar was hidden.
 *
 * "Schedule M" points at the home page's own Schedule M section — the
 * "Schedule M · Regulatory Pressure" block rendered by PharmaScheduleM — and
 * NOT at the external CDSCO PDF. `ROUTES.scheduleM` remains the source of truth
 * for that document; it is still linked from the Schedule M section itself and
 * from the guide page, so nothing lost a route here.
 *
 * The leading slash matters. This footer also renders on /contact,
 * /pharma-compliance-guide and the webinar page, so a bare `#schedule-m` — which
 * is what `ROUTES.compliance` holds, for same-page use — would scroll to nothing
 * on those routes instead of navigating home. Same form the Header's menu uses.
 *
 * "About Satat" leaves this site for the parent company at satat.tech and opens
 * in a new tab — this site is one product surface, and the visitor should not
 * lose their place in it to read the company page. It carries no external-link
 * glyph, by request: the row is short enough that one decorated item pulled the
 * eye off the rest. It is a plain `<a>`, not a `<Link>` — next/link prefetches
 * and client-routes, neither of which applies to another origin.
 */
const LINKS: FooterLink[] = [
  { label: "About Satat", href: "https://satat.tech/", external: true },
  { label: CTA_LABELS.guide, href: ROUTES.guide },
  { label: "Schedule M", href: "/#schedule-m" },
  { label: "Contact", href: ROUTES.contact },
];

/**
 * Rendered as plain text, deliberately NOT as links. `/privacy-policy` and
 * `/terms` do not exist as routes, so linking them sent people to a 404 — the
 * labels stay for the legal notice they carry, without promising a document the
 * site cannot yet serve. Turn each back into a `<Link>` once those pages ship.
 */
const LEGAL = ["Privacy Policy", "Terms & Conditions"];

/**
 * Social links are intentionally absent: the Manufacturing footer carries none,
 * and the real handles were not supplied. To add them, drop entries in here —
 * the markup slot is directly under the tagline. Brand glyphs are NOT available
 * in lucide-react v1 (brand icons were removed), so use inline SVG marks.
 *
 *   const SOCIAL = [{ label: "LinkedIn", href: "…", mark: <svg …/> }];
 */

export default function Footer() {
  const ref = useReveal<HTMLElement>({ y: 24, stagger: 0.09 });

  return (
    <footer
      ref={ref}
      className="border-t border-line bg-gradient-to-b from-white via-surface to-orange/6 text-ink"
    >
      {/* ── Brand block ─────────────────────────────────── */}
      <div className="mx-auto flex max-w-[1180px] flex-col items-center px-5 py-14 lg:px-8 lg:py-16">
        <Link data-reveal href="/" aria-label="Satat Technologies — home" className="select-none">
          <Image
            src="/satat-logo.svg"
            alt="Satat Technologies"
            width={200}
            height={126}
            className="h-16 w-auto object-contain"
          />
        </Link>

        <p
          data-reveal
          className="mt-6 max-w-xl text-center text-[14px] font-normal leading-relaxed text-muted"
        >
          ERPNext specialists for pharmaceutical manufacturing. Batch traceability, quality,
          documentation and audit readiness &mdash; built around how your unit actually runs.
        </p>

        {/* ── Link row ──────────────────────────────────────
            Inline flow rather than flex, so the row rewraps to however many
            lines the viewport allows. The wrap is steered by controlling where
            break opportunities exist at all: each label sits in a
            `whitespace-nowrap` span so a two-word label like "About Satat"
            can never split, the `·` follows with no whitespace before it so it
            can never be stranded at the start of a line, and the explicit
            `{" "}` after it is the ONLY place a line may break. Remove that
            space and the row becomes one unbreakable line that overflows the
            viewport — there is no other whitespace in this markup. */}
        <nav
          data-reveal
          aria-label="Footer"
          className="mt-8 max-w-4xl text-center text-[14px] leading-loose"
        >
          {LINKS.map((l, i) => (
            <Fragment key={l.label}>
              <span className="whitespace-nowrap">
                {l.external ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                )}
                {i < LINKS.length - 1 && (
                  <span aria-hidden="true" className="ml-3 mr-2.5 text-ink/25">
                    &middot;
                  </span>
                )}
              </span>
              {i < LINKS.length - 1 && " "}
            </Fragment>
          ))}
        </nav>

        {/* The pin flows inline with the first line of the address rather than
            sitting in a flex gutter, so the whole block stays optically centred
            once the address wraps to two lines. */}
        <p
          data-reveal
          className="mt-8 max-w-md text-center text-[13px] leading-relaxed text-muted"
        >
          <MapPin
            size={14}
            strokeWidth={2.2}
            className="mr-1.5 inline-block shrink-0 align-[-2px] text-teal"
          />
          {CONTACT.address}
        </p>
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-6 text-center text-[13px] font-normal text-muted lg:px-8">
          <span>
            &copy; {new Date().getFullYear()} Satat Technologies. All rights reserved.
          </span>
          <span aria-hidden="true" className="mx-3 hidden text-ink/20 sm:inline">
            &middot;
          </span>
          <span className="mt-2 block sm:mt-0 sm:inline">
            {LEGAL.map((label, i) => (
              <Fragment key={label}>
                <span className="whitespace-nowrap">
                  {label}
                  {i < LEGAL.length - 1 && (
                    <span aria-hidden="true" className="ml-3 mr-2.5 text-ink/25">
                      &middot;
                    </span>
                  )}
                </span>
                {i < LEGAL.length - 1 && " "}
              </Fragment>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
