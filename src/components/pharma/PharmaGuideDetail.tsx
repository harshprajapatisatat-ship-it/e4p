"use client";

import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  GitBranch,
  ClipboardList,
  Factory,
  Calculator,
  FlaskConical,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { SectionShell, SectionHeading, PrimaryButton } from "./PharmaUI";
import { ROUTES } from "@/lib/routes";

/**
 * The long-form body of the guide page, rendered below the hero and its lead
 * form. Three CTAs on this site land here — "Get the Free Guide", "Get the
 * Compliance Guide" and "View Schedule M Guidelines" — so this page has to
 * stand on its own as the destination for all of them.
 *
 * Content rule, as everywhere else on this site: every line is the client's
 * copy, verbatim. The icons, the grouping and the ordering are the only things
 * added. Nothing here states a Schedule M requirement in the site's own voice —
 * the one Schedule M sentence is the client's, and the official CDSCO document
 * is reached from the "View Schedule M Guidelines" button rather than from here.
 */

/** The manufacturing flow the guide walks through, verbatim. */
const INSIDE: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Boxes,
    title: "Batch & material management",
    text: "How products, raw materials, supplier lots, expiry and batch identity are connected.",
  },
  {
    icon: GitBranch,
    title: "Inventory & traceability",
    text: "How stock movements are recorded and how a batch can be traced backward to its materials or forward to customers.",
  },
  {
    icon: ClipboardList,
    title: "Production planning",
    text: "How customer demand and stock requirements turn into production and purchase decisions.",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    text: "How formulas, production stages, machines, operators, yields and actual production records come together.",
  },
  {
    icon: Calculator,
    title: "Cost & margins",
    text: "How material consumption and machine time build the actual cost of a batch, and how that cost reaches the sale.",
  },
  {
    icon: FlaskConical,
    title: "Quality checks",
    text: "How quality controls can follow materials and batches throughout the manufacturing lifecycle.",
  },
];

/** The four questions the guide is organised around, verbatim. */
const QUESTIONS = [
  "Can you trace a finished batch back to the raw material lots that went into it?",
  "Can you see what a batch actually cost?",
  "Can quality stop a batch from moving forward when something fails?",
  "Can production, inventory, quality and accounts work from the same records?",
];

export default function PharmaGuideDetail() {
  const ref = useReveal<HTMLDivElement>({ y: 26, stagger: 0.06, duration: 0.85 });

  return (
    <div ref={ref}>
      {/* ── What will you see inside? ──────────────────────────────────── */}
      <SectionShell tone="surface">
        <SectionHeading eyebrow="What's inside" title="What will you" accent="see inside?" />

        <p
          data-reveal
          className="mx-auto mt-5 max-w-[720px] text-balance text-center leading-relaxed text-muted"
          style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)" }}
        >
          From the moment materials enter the plant to the moment a finished batch reaches the
          customer, the guide walks through the flow of:
        </p>

        <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              data-reveal
              className="lift-card rounded-[18px] border border-line bg-white p-6"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-[11px]"
                style={{ background: "rgba(247,148,30,0.1)" }}
              >
                <Icon size={19} strokeWidth={2.1} style={{ color: "var(--color-orange)" }} />
              </span>
              <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>

        {/* The client's one Schedule M line. The official CDSCO document is
            reached from the "View Schedule M Guidelines" button instead, so it
            is not repeated here. */}
        <div
          data-reveal
          className="mt-8 rounded-[18px] border-l-2 bg-navy/4 p-6"
          style={{ borderLeftColor: "var(--color-orange)" }}
        >
          <p className="text-[15px] leading-relaxed text-ink">
            And importantly, it also shows what needs to be built next as the system moves
            toward broader Revised Schedule M requirements.
          </p>
        </div>
      </SectionShell>

      {/* ── Why should you read it? ────────────────────────────────────── */}
      <SectionShell>
        <SectionHeading eyebrow="Why read it" title="Why should" accent="you read it?" />

        <div className="mx-auto mt-8 max-w-[820px]">
          <p
            data-reveal
            className="text-balance text-center leading-relaxed text-muted"
            style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)" }}
          >
            Because pharma ERP decisions should not start with a list of features. They should
            start with a much more important question:
          </p>

          <p
            data-reveal
            className="mt-6 text-balance text-center leading-snug text-ink"
            style={{ fontSize: "clamp(1.15rem,2vw,1.5rem)", fontWeight: 700 }}
          >
            Can the system actually keep the plant and the business{" "}
            <span className="text-orange">under control?</span>
          </p>

          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2">
            {QUESTIONS.map((q) => (
              <li
                key={q}
                data-reveal
                className="flex items-start gap-3 rounded-[16px] border border-line bg-surface p-5"
              >
                <HelpCircle
                  size={17}
                  strokeWidth={2.2}
                  className="mt-[2px] shrink-0 text-teal-deep"
                />
                <span className="text-[14.5px] font-semibold leading-relaxed text-ink">{q}</span>
              </li>
            ))}
          </ul>

          <p
            data-reveal
            className="mt-8 text-balance text-center leading-relaxed text-muted"
            style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)" }}
          >
            The guide brings these questions together and shows how ERPNext approaches them in a
            real manufacturing flow.
          </p>
        </div>
      </SectionShell>

      {/* ── A practical look, not a feature brochure ───────────────────── */}
      <SectionShell tone="surface">
        <div className="mx-auto max-w-[820px]">
          <SectionHeading
            eyebrow="How it's written"
            title="A practical look,"
            accent="not a feature brochure"
          />

          <div className="mt-8 space-y-5 text-center">
            <p data-reveal className="text-[15.5px] leading-relaxed text-muted">
              This is not a screen-by-screen ERPNext manual. It focuses on what each capability
              means inside a pharmaceutical plant and why it matters, using demonstration data to
              show the behaviour of the system.
            </p>
            <p data-reveal className="text-[15.5px] leading-relaxed text-muted">
              If you are evaluating ERPNext for pharma manufacturing, planning your digital
              transformation, or simply trying to understand what a modern pharma ERP should
              actually control, this is worth reading.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ── Close ──────────────────────────────────────────────────────── */}
      <SectionShell>
        <div className="mx-auto max-w-[820px] text-center">
          <p
            data-reveal
            className="text-balance leading-snug text-ink"
            style={{ fontSize: "clamp(1.3rem,2.6vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Download the guide and see the{" "}
            <span className="text-orange">complete manufacturing flow.</span>
          </p>

          {/* Goes to the form, not to the file — the form is the gate, and the
              PDF is handed over on the other side of it. The label says "get",
              not "download", so it does not promise a file this click. */}
          <div data-reveal className="mt-8 flex justify-center">
            <PrimaryButton
              href={ROUTES.guideForm}
              label="Get the Pharma Manufacturing on ERPNext Guide"
              size="lg"
              icon={<ArrowRight size={18} strokeWidth={2.4} />}
            />
          </div>

          <p data-reveal className="mt-8 text-[15px] leading-relaxed text-muted">
            Understand the foundation. See what works today. Know what comes next.
          </p>
        </div>
      </SectionShell>
    </div>
  );
}
