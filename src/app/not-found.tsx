import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { PrimaryButton, SecondaryButton } from "@/components/pharma/PharmaUI";
import { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * On-brand 404.
 *
 * This build ships the home page plus the two conversion pages. Several nav and
 * footer destinations (/solutions, /industries, /blogs, /company, /resources,
 * /privacy-policy, /terms) are the client's existing routes and are intentionally
 * linked at their canonical paths — until those pages exist here, they land on
 * this page rather than on Next's default error screen, and the two conversions
 * stay one click away.
 *
 * It uses a reduced header rather than the site `Header`: this route is
 * prerendered at build time, where the full header's `usePathname()` has no
 * router context. A 404 has no nav state to highlight anyway.
 */
export default function NotFound() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-white">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Logo />
            <Link
              href={ROUTES.demo}
              className="inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-2.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#e8870f]"
            >
              {CTA_LABELS.demo}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-white pb-20 pt-[104px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgba(247,148,30,0.08), transparent 70%), radial-gradient(55% 45% at 90% 10%, rgba(0,68,124,0.07), transparent 72%)",
          }}
        />
        <div className="mx-auto w-full max-w-[1320px] px-5 lg:px-8">
          <div className="max-w-[62ch]">
            <p className="eyebrow" style={{ color: "var(--color-orange)", letterSpacing: "0.2em" }}>
              Error 404
            </p>
            <h1 className="display-lg mt-4 text-balance text-ink">
              This page isn&rsquo;t <span className="text-orange">here yet</span>
            </h1>
            <p className="mt-5 text-[15.5px] leading-relaxed text-muted">
              The link is valid but the page hasn&rsquo;t been published on this site. Head back
              to the pharma overview, or go straight to the two things most people came for.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <PrimaryButton
                href={ROUTES.demo}
                label={CTA_LABELS.demo}
                size="lg"
                icon={<ArrowRight size={18} strokeWidth={2.4} />}
              />
              <SecondaryButton href={ROUTES.guide} label={CTA_LABELS.guide} size="lg" />
              <SecondaryButton href="/" label="Back to home" size="lg" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
