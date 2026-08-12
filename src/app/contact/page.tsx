import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PharmaLeadForm from "@/components/pharma/PharmaLeadForm";
import { CONTACT } from "@/lib/routes";

/**
 * Contact us.
 *
 * Reached from the hero's "Get in touch" and from the Schedule M section's
 * "Let's Make Your Pharma Unit Audit-Ready". The demo/webinar CTA no longer
 * lands here — it goes to /erpnext-pharma-webinar.
 *
 * Every phone number, address and email on this page comes from `CONTACT` in
 * routes.ts, which holds Satat's real details. Nothing here is placeholder
 * copy: a wrong number on a contact page is worse than no number at all.
 */
export const metadata: Metadata = {
  title: "Contact Us — ERPNext for Pharma Manufacturing | Satat Technologies",
  description:
    "Talk to Satat Technologies about ERPNext for your pharmaceutical unit — batch traceability, documentation, quality control and audit readiness. Call +91 87990 27217 or send us a message.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Satat Technologies — ERPNext for Pharma",
    description:
      "Tell us about your unit and we'll map out how ERPNext fits the way you actually run.",
    type: "website",
  },
};

/** What Satat brings, in this site's own pharma terms. */
const POINTS = [
  "ERPNext specialists for pharmaceutical manufacturing",
  "Batch traceability, documentation and quality control in one system",
  "Built around how your unit actually runs, not a generic template",
  "Support that continues after go-live, not just through implementation",
];

/** The two direct channels, alongside the form. */
const CHANNELS = [
  { icon: Phone, value: CONTACT.phone, note: CONTACT.phoneNote, href: CONTACT.tel },
  { icon: Mail, value: CONTACT.email, note: CONTACT.emailNote, href: CONTACT.mailto },
];

export default function ContactPage() {
  return (
    <>
      <Header />
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
          {/* ── Intro ───────────────────────────────────────────────────── */}
          <div className="mx-auto max-w-[760px] text-center">
            <p
              className="eyebrow inline-flex items-center gap-2 rounded-pill border border-orange/25 bg-orange/8 px-4 py-1.5"
              style={{ color: "var(--color-orange)", letterSpacing: "0.16em" }}
            >
              <MessageSquare size={14} strokeWidth={2.4} />
              Contact us
            </p>

            <h1 className="display-lg mt-5 text-balance text-ink">
              Let&rsquo;s talk about your{" "}
              <span className="text-orange">pharma operation</span>
            </h1>

            <p
              className="mx-auto mt-5 text-balance leading-relaxed text-muted"
              style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)", maxWidth: "58ch" }}
            >
              Tell us about your unit — the batches you make, the records you have to produce
              and the audits you have to be ready for — and we&rsquo;ll map out how ERPNext
              fits the way you already run. No slides, no pitch.
            </p>
          </div>

          {/* ── Details + form ──────────────────────────────────────────── */}
          <div className="mt-14 overflow-hidden rounded-[22px] border border-line bg-white lg:mt-16">
            <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
              {/* Left — who you are reaching */}
              <div
                className="border-b border-line p-8 lg:border-b-0 lg:border-r lg:p-10"
                style={{ background: "var(--color-surface)" }}
              >
                <p className="eyebrow" style={{ letterSpacing: "0.18em" }}>
                  Let&rsquo;s chat
                </p>
                <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight text-ink">
                  Start your ERPNext journey with Satat Technologies
                </h2>

                <ul className="mt-7 flex list-none flex-col gap-3">
                  {POINTS.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink">
                      <span
                        aria-hidden
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: "var(--color-orange)" }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>

                <ul className="mt-9 flex list-none flex-col gap-5">
                  {CHANNELS.map(({ icon: Icon, value, note, href }) => (
                    <li key={value}>
                      <a href={href} className="group flex items-center gap-4">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "var(--color-navy)" }}
                        >
                          <Icon size={17} strokeWidth={2.2} className="text-white" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[15.5px] font-bold text-ink transition-colors group-hover:text-orange">
                            {value}
                          </span>
                          <span className="block text-[13px] text-muted">{note}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 flex items-start gap-2.5 text-[13.5px] leading-relaxed text-muted">
                  <MapPin size={15} strokeWidth={2.2} className="mt-[3px] shrink-0 text-teal" />
                  {CONTACT.address}
                </p>
              </div>

              {/* Right — the form */}
              <div className="p-6 sm:p-8 lg:p-10">
                <PharmaLeadForm variant="contact" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
