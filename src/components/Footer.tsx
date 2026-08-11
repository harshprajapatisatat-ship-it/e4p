"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, ExternalLink } from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * Footer for the ERPNext-for-Pharma site.
 *
 * Same design system as the Manufacturing footer: `bg-orange/2` over a top
 * border, a 1180px container, a brand column plus link columns on a 5-column
 * grid, and a divided bottom bar. Columns are pharma-facing, and the primary
 * conversion sits in the brand column so it is reachable from the very bottom
 * of the page.
 */

type FooterLink = { label: string; href: string; external?: boolean };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Pharma",
    links: [
      { label: "Batch Traceability", href: "/#challenges" },
      { label: "Batch Documentation", href: "/#challenges" },
      { label: "Quality Control", href: "/#challenges" },
      { label: "Inventory & Expiry", href: "/#challenges" },
      { label: "Warehouse Control", href: "/#challenges" },
      { label: "Equipment Validation", href: "/#challenges" },
      { label: "Audit Readiness", href: "/#challenges" },
    ],
  },
  {
    title: "ERPNext Solutions",
    links: [
      { label: "ERPNext Implementation", href: "/solutions" },
      { label: "ERPNext Consulting", href: "/solutions" },
      { label: "Customization & Development", href: "/solutions" },
      { label: "Hosting & Infrastructure", href: "/solutions" },
      { label: "Support & Maintenance", href: "/solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: CTA_LABELS.guide, href: ROUTES.guide },
      { label: "Schedule M Readiness", href: "/#schedule-m" },
      { label: CTA_LABELS.scheduleM, href: ROUTES.scheduleM, external: true },
      { label: "Audit Readiness Checklist", href: "/resources" },
      { label: "Blogs", href: "/blogs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Satat", href: "/company#about" },
      { label: "Careers", href: "/company#careers" },
      { label: "Contact", href: "/contact" },
      { label: CTA_LABELS.demo, href: ROUTES.demo },
    ],
  },
];

/**
 * Social links are intentionally absent: the Manufacturing footer carries none,
 * and the real handles were not supplied. To add them, drop entries in here —
 * the markup slot is below the demo CTA. Brand glyphs are NOT available in
 * lucide-react v1 (brand icons were removed), so use inline SVG marks.
 *
 *   const SOCIAL = [{ label: "LinkedIn", href: "…", mark: <svg …/> }];
 */

export default function Footer() {
  const ref = useReveal<HTMLElement>({ y: 30, stagger: 0.1 });

  return (
    <footer ref={ref} className="border-t border-line bg-orange/2 text-ink">
      <div className="mx-auto max-w-[1180px] px-5 py-16 lg:px-8 lg:py-24">
        {/* ── Columns ───────────────────────────────────── */}
        <div
          data-reveal
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/">
              <Image
                src="/satat-logo.svg"
                alt="Satat Technologies"
                width={160}
                height={64}
                className="h-16 w-auto object-contain"
                priority
              />
            </Link>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-muted">
              ERPNext specialists for pharmaceutical manufacturing. Batch traceability,
              quality, documentation and audit readiness &mdash; built around how your unit
              actually runs.
            </p>
            <p className="mt-4 flex items-start gap-2 text-[13.5px] leading-relaxed text-muted">
              <MapPin size={14} className="mt-[3px] shrink-0 text-teal" />
              501 Aarohi Verve, Bopal-Ambli Cross Road, Sardar Patel Ring Rd, Ahmedabad,
              Gujarat &ndash; 380058 India
            </p>

            <Link
              href={ROUTES.demo}
              className="mt-5 inline-flex items-center justify-center rounded-[10px] bg-orange px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#d4760a]"
            >
              {CTA_LABELS.demo}
            </Link>

            {/* ↑ Social link row goes here when handles are supplied — see the
                SOCIAL note above this component. */}
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-widest text-muted/70">
                {col.title}
              </h4>
              <ul className="mt-4 list-none space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-[14px] text-ink/70 transition-colors hover:text-ink"
                      >
                        {l.label}
                        <ExternalLink size={12} strokeWidth={2.3} className="shrink-0" />
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-[14px] text-ink/70 transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Compliance note ───────────────────────────────
            States plainly what ERPNext does and does not do, so nothing above it
            can be read as a regulatory claim. */}
        <p
          data-reveal
          className="mt-14 max-w-[86ch] border-t border-line pt-8 text-[12.5px] leading-relaxed text-muted"
        >
          ERPNext supports systematic processes, documentation, traceability and audit
          readiness. Satat Technologies is an ERPNext implementation partner; nothing on this
          site constitutes a regulatory certification, approval, or a guarantee of compliance
          with Schedule M or any other regulation. Schedule M content is summarised for
          context &mdash; always refer to the official CDSCO publication.
        </p>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div
          data-reveal
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-[13px] text-muted sm:flex-row"
        >
          <span>© {new Date().getFullYear()} Satat Technologies. All rights reserved.</span>
          <span className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms &amp; Conditions
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
