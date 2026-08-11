"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  GitBranch,
  FileSignature,
  ShieldCheck,
  CalendarClock,
  Warehouse,
  Gauge,
  GitPullRequest,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { SectionShell, SectionHeading, PrimaryButton } from "./PharmaUI";
import { ROUTES, CTA_LABELS } from "@/lib/routes";
import {
  TraceabilityVisual,
  DocumentationVisual,
  QualityVisual,
  ExpiryVisual,
  WarehouseVisual,
  EquipmentVisual,
  ChangeControlVisual,
  AuditVisual,
} from "./visuals/ChallengeVisuals";

/**
 * "What Pharma Manufacturing Deals With, Every Single Day".
 *
 * Eight challenges, in the client's copy and only the client's copy. The first
 * five were supplied with a category and their own headline; the last three
 * were supplied as a category and a paragraph, so they carry no headline here
 * — nothing on this page is written for the client.
 *
 * The layout is scriptrunner.ai's BENEFITS section: a stack of equal cards, each
 * `position: sticky` at the same offset, so every card slides up and covers the
 * one before it. Cards that have been covered scale down and stay behind, which
 * is what turns the pile into a visible stack rather than a single swap. Their
 * scale steps measured 1.0 → 0.90 → 0.85 over three cards, smoothed by a 500ms
 * CSS transition on the card itself; the same transition does the smoothing here.
 *
 * The step is gentler than theirs (0.035, floored at 0.86) because this stack is
 * eight cards deep rather than three, and their 0.05 per card would shrink the
 * first one to two-thirds size by the end.
 *
 * Sticky is a `lg:` behaviour only, exactly as in the reference — below that the
 * cards are an ordinary stacked list.
 */

/** Sticky offset: the 72px fixed header, plus breathing room. */
const STICKY_TOP = 96;

/**
 * Cards size to their own content rather than to the reference's flat 600px, so
 * no card carries a well of empty space under its copy.
 *
 * The `lg:max-h-[calc(100vh-9rem)]` on the card is not cosmetic: a card taller
 * than `viewport - STICKY_TOP` has its bottom below the fold with no way to
 * scroll it into view, because the card is pinned — scrolling moves nothing
 * until the next card arrives. On a 1366×768 laptop the viewport is ~640px, so
 * anything over ~544px would strand its own footer. 9rem leaves 48px of
 * clearance beneath the pinned card.
 */

type Challenge = {
  n: string;
  category: string;
  icon: LucideIcon;
  /** Only 01–05 were given one. */
  title?: string;
  body: string;
  visual: () => React.ReactElement;
};

const CHALLENGES: Challenge[] = [
  {
    n: "01",
    category: "Batch Traceability",
    icon: GitBranch,
    title: "Every Batch Has to Tell Its Complete Story",
    body: "Batch is everything in pharma. What went into it, how it was made, who approved it, all of it needs to be traceable, instantly. When a batch can't be traced back, the consequences aren't small, a delayed audit, a customer complaint that can't be resolved, a recall that can't be contained fast enough. That's why traceability isn't a nice-to-have. It's the one thing pharma companies can't afford to get wrong.",
    visual: TraceabilityVisual,
  },
  {
    n: "02",
    category: "Managing Extensive Documentation",
    icon: FileSignature,
    title: "In Pharma, Every Process Needs Proof",
    body: "Creating the medicine is only half the job. You also need proof that it's safe, what it contains, what it doesn't, when it was made, and who signed off at every step. In pharma, nothing is assumed; everything is documented. But that only works when the process is systematic. Without it, documentation becomes delayed, incomplete, or dependent on manual effort, and in an industry where paperwork can make or break a company, that's a risk no one can afford.",
    visual: DocumentationVisual,
  },
  {
    n: "03",
    category: "Ensuring Consistent Product Quality",
    icon: ShieldCheck,
    title: "Quality Isn't One Check. It's Every Step.",
    body: "Ask any pharma company what matters most, and the answer is quality, not quantity. Twenty medicines made right matter more than fifty made carelessly. That means every step, from raw material to finished product, goes through multiple quality checks, and it has to. But without a defined process to maintain and verify quality at each stage, this becomes one of the hardest things to get consistently right, batch after batch.",
    visual: QualityVisual,
  },
  {
    n: "04",
    category: "Inventory & Expiry Management",
    icon: CalendarClock,
    title: "No Room for Expired, No Room for Risk",
    body: "From raw materials to finished goods, nothing in pharma can afford to expire unnoticed. The consequences are too high, a health risk to patients, a compliance risk to the company, and a cost no pharma business wants to pay. This is one of the most common daily battles pharma companies face: making sure everything that leaves the facility is safe, accounted for, and fully documented.",
    visual: ExpiryVisual,
  },
  {
    n: "05",
    category: "Warehouse Control",
    icon: Warehouse,
    title: "Every Storage Location Has a Purpose",
    body: "This isn't unique to pharma, most manufacturing deals with it. But in pharma, the stakes are higher. Multiple warehouses, temperature-sensitive products, quarantine areas, released stock, rejected materials, sample inventory, each needs to be known, tracked, and handled correctly. One mismanaged location can mean a compliance gap or a compromised product.",
    visual: WarehouseVisual,
  },
  {
    n: "06",
    category: "Equipment Maintenance & Validation",
    icon: Gauge,
    body: "Manufacturing equipment has to stay calibrated, validated, and maintained, not just for smooth production, but because a lapse here directly affects regulatory compliance.",
    visual: EquipmentVisual,
  },
  {
    n: "07",
    category: "Change Control & Deviations",
    icon: GitPullRequest,
    body: "Every process change, deviation, and investigation needs a documented trail, corrective actions (CAPA) and approvals, without putting compliance or product quality at risk.",
    visual: ChangeControlVisual,
  },
  {
    n: "08",
    category: "Audit Readiness",
    icon: ClipboardCheck,
    body: "When regulators show up, there's no time to prepare. Records, approvals, traceability, documentation, everything needs to already be accurate, complete, and easy to pull up.",
    visual: AuditVisual,
  },
];

function StackCard({ c }: { c: Challenge }) {
  const Icon = c.icon;
  const Visual = c.visual;
  return (
    <article
      data-stack-card
      className="flex w-full flex-col overflow-hidden rounded-[24px] border border-line bg-white p-5 sm:p-7 lg:sticky lg:max-h-[calc(100vh-9rem)] lg:flex-row lg:items-start lg:gap-12 lg:p-10"
      style={{
        top: STICKY_TOP,
        // Promote to its own layer: eight of these are composited at once while
        // the scale steps run.
        willChange: "transform",
        // The reference smooths its scale steps with a 500ms CSS transition on
        // the card rather than tweening every frame; same here, so the JS only
        // ever writes a target value.
        transition: "transform 500ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Both columns align to the top of the card. */}
      <div className="flex flex-col justify-start lg:flex-1">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: "rgba(247,148,30,0.1)" }}
          >
            <Icon size={19} strokeWidth={2.1} className="text-orange" />
          </span>
          <span className="min-w-0">
            <span
              className="data-mono block text-[12px] font-extrabold leading-none"
              style={{ color: "rgba(11,31,51,0.45)" }}
            >
              {c.n}
            </span>
            {c.title && (
              <span
                className="eyebrow mt-1 block truncate"
                style={{ fontSize: "0.66rem", letterSpacing: "0.16em" }}
              >
                {c.category}
              </span>
            )}
          </span>
        </div>

        <h3
          className="mt-5 text-balance leading-tight tracking-tight text-ink"
          style={{ fontSize: "clamp(1.25rem,2vw,1.75rem)", fontWeight: 800 }}
        >
          {c.title ?? c.category}
        </h3>
        <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">{c.body}</p>
      </div>

      <div className="mt-7 min-w-0 lg:mt-0 lg:flex-1">
        <Visual />
      </div>
    </article>
  );
}

export default function PharmaChallenges() {
  const headingRef = useReveal<HTMLDivElement>({ y: 28, stagger: 0.07 });
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stack.current;
    if (!el) return;

    // Sticky stacking is a desktop behaviour in the reference too, and the
    // scale-down only makes sense once the cards actually overlap.
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-stack-card]"));
    if (cards.length < 2) return;

    const last: number[] = cards.map(() => 1);

    /**
     * Document offset of a card, walking `offsetTop`. Deliberately not
     * `getBoundingClientRect`: that reports the *painted* box, so a card we have
     * already scaled down reads as lower than it is and stops counting as
     * covering the cards beneath it — which silently caps every card at a single
     * scale step instead of compounding.
     */
    const docTop = (node: HTMLElement) => {
      let y = 0;
      let n: HTMLElement | null = node;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return y;
    };

    let tops = cards.map(docTop);

    const update = () => {
      const line = window.scrollY + STICKY_TOP + 2;
      for (let i = 0; i < cards.length; i++) {
        // How many later cards have reached the sticky line and are therefore
        // sitting on top of this one.
        let covered = 0;
        for (let j = i + 1; j < cards.length; j++) if (line >= tops[j]) covered++;

        // The reference steps 0.05 per card. Its stack is three deep, so the
        // depth is capped at three here: past that the card is fully buried and
        // shrinking it further only makes the pile look ragged.
        const scale = 1 - 0.05 * Math.min(covered, 3);
        // Only write when it actually changes — this runs on every scroll tick.
        if (scale !== last[i]) {
          last[i] = scale;
          cards[i].style.transform = `scale(${scale})`;
        }
      }
    };

    const remeasure = () => {
      tops = cards.map(docTop);
      update();
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: update,
      onRefresh: remeasure,
    });
    update();

    return () => {
      st.kill();
      cards.forEach((c) => {
        c.style.transform = "";
      });
    };
  }, []);

  return (
    <SectionShell id="challenges" tone="surface">
      <div ref={headingRef}>
        <SectionHeading
          eyebrow="The Daily Reality"
          title="What Pharma Manufacturing Deals With,"
          accent="Every Single Day"
          desc="Manufacturing a medicine is the easy part. Making sure it's safe, compliant, and traceable, every single time, is the real job. That's the responsibility pharma carries, and it has to be proven, not assumed."
        />
      </div>

      {/* The stack itself is deliberately outside the reveal wrapper: those
          children get an opacity/translate of their own, which would fight the
          sticky positioning and the scale being written here.

          The trailing spacer is what gives card 08 a turn. A sticky element
          stays pinned only while its containing block still has room beneath it,
          and the container otherwise ends at card 08's own bottom edge — zero
          room, so it never pins and scrolls straight past while every other card
          gets a full beat.

          There is deliberately NO trailing spacer. Card 08 is still part of the
          effect — it rises and covers 07 like every other card — but the stack
          ends level with it, so nothing holds the viewport once it has landed.
          Any spacer here buys card 08 a pinned beat at the cost of that much
          scrolling before the CTA below can appear; the CTA is meant to come up
          with card 08, not after a pause. */}
      <div ref={stack} className="mt-12 flex flex-col gap-6 lg:mt-16">
        {CHALLENGES.map((c) => (
          <StackCard key={c.n} c={c} />
        ))}
      </div>

      {/* Sits close under card 08 so it comes into view with it, rather than
          reading as a separate beat after the stack. */}
      <div className="mt-10 flex justify-center lg:mt-12">
        <PrimaryButton
          href={ROUTES.demo}
          label={CTA_LABELS.seeSolution}
          size="lg"
          icon={<ArrowRight size={18} strokeWidth={2.4} />}
        />
      </div>
    </SectionShell>
  );
}
