import type { Metadata } from "next";
import Link from "next/link";
import { Video } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import PharmaWebinarForm from "@/components/pharma/PharmaWebinarForm";
import { getWebinarSessions } from "@/lib/webinarSessions";
import { ROUTES } from "@/lib/routes";

/**
 * Webinar registration.
 *
 * HIDDEN: nothing on the site links here any more — the "Book a Free Demo" CTA
 * now goes to /contact — and the page is marked `noindex` below. Everything
 * still works by direct link; see ROUTES.webinar in routes.ts.
 *
 * The panel on the right is a faithful rebuild of the Manufacturing site's
 * `/erpnext-manufacturing-webinar` form; the column on the left follows the
 * same shape (headline, lede, date picker, what you get) with pharma copy.
 */
export const metadata: Metadata = {
  title: "ERPNext Pharma Manufacturing Webinar | Satat Technologies",
  description:
    "A live session for pharmaceutical manufacturers — see how ERPNext runs batch traceability, documentation, quality control and audit readiness in one connected system. Live demo included.",
  alternates: { canonical: "/erpnext-pharma-webinar" },
  // HIDDEN: the page still renders and still works by direct link, but it is
  // unlinked from every menu, CTA and footer, and this keeps search engines
  // from listing it while it is off the site. Delete this `robots` block to
  // put it back in the index.
  robots: { index: false, follow: false },
  openGraph: {
    title: "ERPNext Pharma Manufacturing Webinar",
    description:
      "See how ERPNext runs batch traceability, documentation, quality control and audit readiness in one connected system. Live demo included.",
    type: "website",
  },
};

/**
 * Sessions are no longer written here. They live in the `Webinar Session`
 * Doctype in ERPNext, and are read at request time — enabled and not-yet-past
 * slots only. Add, move or retire a date in ERPNext and this page follows with
 * no deploy. The same list feeds the date picker below and the form's dropdown,
 * so the two cannot drift apart.
 */

const WHAT_YOU_GET = [
  "Live ERPNext demo on real pharma manufacturing data",
  "Built for Indian pharma SMEs and mid-size units",
  "Open Q&A — bring the part of your process that is hardest to prove",
];

export default async function PharmaWebinarPage() {
  const sessions = await getWebinarSessions();

  return (
    <>
      <SiteHeader />
      <main className="relative isolate overflow-hidden bg-white pb-20 pt-[104px] lg:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 10% 0%, rgba(247,148,30,0.08), transparent 70%), radial-gradient(55% 45% at 92% 8%, rgba(0,68,124,0.07), transparent 72%)",
          }}
        />

        <div className="mx-auto w-full max-w-[1320px] px-5 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,0.8fr)] lg:gap-16">
            {/* ── Left: the pitch ─────────────────────────────────────── */}
            <div>
              <p
                className="eyebrow inline-flex items-center gap-2 rounded-pill border border-orange/25 bg-orange/8 px-4 py-1.5"
                style={{ color: "var(--color-orange)", letterSpacing: "0.16em" }}
              >
                <Video size={14} strokeWidth={2.4} />
                Live webinar · Pharma
              </p>

              <h1 className="display-lg mt-5 text-balance text-ink">
                Make Every Batch Provable with{" "}
                <span className="text-orange">ERPNext</span>
              </h1>

              <p
                className="mt-5 text-balance leading-relaxed text-muted"
                style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)", maxWidth: "56ch" }}
              >
                A live session for pharmaceutical manufacturers — see exactly how ERPNext
                runs batch traceability, documentation, quality control and audit readiness in
                one connected system. Live demo included.
              </p>

              {/* ── Sessions ──────────────────────────────────────────── */}
              <div
                className="mt-8 rounded-[18px] border p-6"
                style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}
              >
                {/* "Choose the date that suits you" read as an instruction to
                    pick one HERE, and the pills below reinforced it — people
                    clicked them and nothing happened. This block only ANNOUNCES
                    the dates; the actual choosing is the dropdown in the form. */}
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {sessions.length > 0 ? "Upcoming sessions" : "Next date being scheduled"}
                </p>

                {/* An empty list is a real answer from ERPNext — every slot is
                    disabled or past — so say so rather than render an empty row.
                    Registration is disabled in that state, so this must not tell
                    anyone to use the form; it points at /contact instead. */}
                {sessions.length === 0 ? (
                  <p className="mt-4 text-[14px] leading-relaxed text-muted">
                    We are scheduling the next session, so registration is closed for now.{" "}
                    <Link href={ROUTES.contact} className="font-semibold text-orange underline underline-offset-2">
                      Contact us
                    </Link>{" "}
                    and we will let you know as soon as the date is confirmed.
                  </p>
                ) : (
                  <>
                    {/* A plain list, not pills. A bordered pill on a pale fill is
                        the same shape this site uses for buttons, so it read as
                        selectable; rows separated by hairlines read as a
                        schedule, which is what this is. */}
                    <ul className="mt-3 list-none">
                      {sessions.map((s, i) => {
                        const isNext = i === 0;
                        return (
                          <li
                            key={s.value}
                            className="flex items-center justify-between gap-4 border-t border-line py-2.5 first:border-t-0 first:pt-1"
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="truncate text-[13.5px] font-semibold text-ink">
                                {s.date}
                              </span>
                              {isNext && (
                                <span
                                  className="shrink-0 rounded-pill px-2 py-0.5 text-[10.5px] font-bold uppercase leading-none tracking-[0.08em]"
                                  style={{ background: "var(--color-orange)", color: "#fff" }}
                                >
                                  Next
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-[12.5px] tabular-nums text-muted">
                              {s.time}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

              </div>

              <ul className="mt-8 flex list-none flex-col gap-2.5">
                {WHAT_YOU_GET.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14.5px] text-ink">
                    <span
                      aria-hidden
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--color-orange)" }}
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: the form ─────────────────────────────────────── */}
            <div className="lg:sticky lg:top-[96px]">
              <PharmaWebinarForm sessions={sessions} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
