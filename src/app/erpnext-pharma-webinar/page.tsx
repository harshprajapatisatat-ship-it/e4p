import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Hourglass, BadgeCheck, Video } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import PharmaWebinarForm from "@/components/pharma/PharmaWebinarForm";
import { getWebinarSessions, type WebinarSession } from "@/lib/webinarSessions";
import { ROUTES } from "@/lib/routes";

/**
 * Webinar registration — the destination every "Book a Free Demo" points at.
 *
 * The panel on the right is a faithful rebuild of the Manufacturing site's
 * `/erpnext-manufacturing-webinar` form; the column on the left follows the
 * same shape (headline, lede, date picker, what you get) with pharma copy.
 */
export const metadata: Metadata = {
  title: "Free ERPNext Pharma Manufacturing Webinar | Satat Technologies",
  description:
    "A free live session for pharmaceutical manufacturers — see how ERPNext runs batch traceability, documentation, quality control and audit readiness in one connected system. Live demo included.",
  alternates: { canonical: "/erpnext-pharma-webinar" },
  openGraph: {
    title: "Free ERPNext Pharma Manufacturing Webinar",
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

/** Shown wherever a time is expected but nothing is scheduled. */
const TBA_LABEL = "To be announced";

/**
 * `"4:00 PM IST"` when every slot runs at the same hour, otherwise
 * `"Multiple times"` — the strip below the dates can only show one value.
 */
function sessionTimeLabel(sessions: readonly WebinarSession[]): string {
  if (sessions.length === 0) return TBA_LABEL;
  return sessions.every((slot) => slot.time === sessions[0].time)
    ? `${sessions[0].time} IST`
    : "Multiple times";
}

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
                Free live webinar · Pharma
              </p>

              <h1 className="display-lg mt-5 text-balance text-ink">
                Make Every Batch Provable with{" "}
                <span className="text-orange">ERPNext</span>
              </h1>

              <p
                className="mt-5 text-balance leading-relaxed text-muted"
                style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)", maxWidth: "56ch" }}
              >
                A free live session for pharmaceutical manufacturers — see exactly how ERPNext
                runs batch traceability, documentation, quality control and audit readiness in
                one connected system. Live demo included.
              </p>

              {/* ── Sessions ──────────────────────────────────────────── */}
              <div
                className="mt-8 rounded-[18px] border p-6"
                style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}
              >
                <p className="eyebrow" style={{ letterSpacing: "0.18em" }}>
                  {sessions.length > 0
                    ? "Choose the date that suits you"
                    : "Next date being scheduled"}
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
                  <ul className="mt-4 flex list-none flex-wrap gap-2.5">
                    {sessions.map((s, i) => (
                      <li
                        key={s.value}
                        className="inline-flex items-center gap-2 rounded-pill border bg-white px-3.5 py-2 text-[13.5px]"
                        style={{
                          borderColor: i === 0 ? "var(--color-orange)" : "var(--color-line)",
                          background: i === 0 ? "rgba(247,148,30,0.06)" : "#fff",
                        }}
                      >
                        <span className="font-bold text-ink">{s.date}</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{s.time}</span>
                        {i === 0 && (
                          <span
                            className="eyebrow rounded-pill px-2 py-0.5 text-white"
                            style={{ background: "var(--color-orange)", letterSpacing: "0.12em" }}
                          >
                            Next
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <hr
                  className="my-5 border-0 border-t"
                  style={{ borderColor: "var(--color-line)" }}
                />

                <ul className="flex list-none flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
                  <li className="inline-flex items-center gap-1.5">
                    <Clock size={14} strokeWidth={2.2} style={{ color: "var(--color-orange)" }} />
                    {sessionTimeLabel(sessions)}
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <Hourglass
                      size={14}
                      strokeWidth={2.2}
                      style={{ color: "var(--color-orange)" }}
                    />
                    Live session
                  </li>
                  <li className="inline-flex items-center gap-1.5 font-semibold text-teal-deep">
                    <BadgeCheck size={14} strokeWidth={2.2} />
                    100% Free
                  </li>
                </ul>
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
