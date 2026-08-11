"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Workflow,
  Gauge,
  ShieldCheck,
  FolderCheck,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { SectionHeading, PrimaryButton, SecondaryButton, SecondaryButtonDark } from "./PharmaUI";
import { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * Schedule M — the urgency section, and the close of the page.
 *
 * This is the one full-bleed navy section. The colour is the brand navy already
 * used for the Manufacturing site's webinar panel, so it reads as emphasis
 * inside the same system rather than as a different website.
 *
 * Content rule: every line here is the client's copy. The section explains what
 * Schedule M asks for and links to the official CDSCO source; it does not claim
 * certification, approval or compliance on anyone's behalf.
 */

/** The four expectations, verbatim. The icon is the only thing added. */
const EXPECTATIONS: { n: string; icon: LucideIcon; text: string }[] = [
  { n: "01", icon: Workflow, text: "Validated manufacturing processes, not just documented ones" },
  { n: "02", icon: Gauge, text: "Equipment that's qualified and calibrated, with proof" },
  {
    n: "03",
    icon: ShieldCheck,
    text: "A quality management system that runs continuously, not just during audits",
  },
  {
    n: "04",
    icon: FolderCheck,
    text: "Complete batch records, available the moment they're asked for",
  },
];

/**
 * The reference's capsules sit scattered and steeply tilted, rotate to level and
 * converge horizontally as they rise into the middle of the section, then tilt
 * back out as they leave — a symmetric scrub, never a fade. Its three run at
 * -24° / +25° / +15° with ±160px of horizontal travel.
 *
 * The capsules are SMALL while scattered — number and icon only — and expand to
 * their full width as they reach the centre, then collapse again on the way out.
 * That is what makes the steep angles possible at all: a pill rotated by θ
 * sweeps `width·sinθ` vertically, so at full width (~900px) anything past ~4.5°
 * would overlap its neighbours and swing 169px onto the section heading. Closed
 * at 172px, 24° sweeps only 70px and clears everything — the same reason the
 * reference can tilt its own ~250px capsules that far.
 */
const COLLAPSED_W = 172;

/**
 * Resting positions: 01 and 03 parked out to the left, 02 and 04 out to the
 * right, each tilted. The offsets are large enough that the two sides read as
 * two separate groups rather than a cluster near the middle — a closed pill is
 * 172px, so ±400 puts its inner edge ~314px off centre with clear air between
 * the columns. The small `y` fans each side apart so the four never line up as
 * a rigid zigzag.
 */

const SCATTER = [
  { rot: -24, x: -400, y: -28 },
  { rot: 25, x: 400, y: -10 },
  { rot: -19, x: -380, y: 10 },
  { rot: 15, x: 420, y: 28 },
];

export default function PharmaScheduleM() {
  // This section has the most `data-reveal` children on the page. At the
  // site-wide 0.12 stagger the last card would still be arriving ~1.6s after the
  // first, so the stagger is tightened here to keep it on screen inside ~1s.
  const ref = useReveal<HTMLDivElement>({ y: 26, stagger: 0.055, duration: 0.85 });
  const pills = useRef<HTMLUListElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pills.current;
    const stageEl = stage.current;
    if (!el || !stageEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Desktop only. The open/closed animation needs the sentence to hold one
    // line so the pill height stays put while the width tweens; below `lg` the
    // copy wraps to two or three lines and there is no room to scatter into.
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("li"));
    if (!items.length) return;

    const texts = Array.from(el.querySelectorAll<HTMLElement>("[data-pill-text]"));

    const ctx = gsap.context(() => {
      // Closed and scattered → open and centred → closed and scattered again,
      // scrubbed across the whole time the list is on screen. The capsule itself
      // never fades; the reference's are fully opaque throughout, and the
      // movement is the entrance. Only the sentence inside fades, because it has
      // nowhere to live while the pill is closed.
      const at = (k: "rot" | "x" | "y") => (i: number) => SCATTER[i % SCATTER.length][k];
      // Function-based so a resize re-reads it; paired with invalidateOnRefresh.
      const open = () => el.clientWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          // Pinned, as the reference is: its stats section is three viewports
          // tall with a `sticky top-0 h-screen` inner, so the heading and
          // capsules hold still in their own space while the effect plays and
          // the next block of copy only arrives once it has finished.
          //
          // ScrollTrigger's pin rather than CSS sticky, because this section is
          // `overflow-hidden` (it clips the decorative washes and the capsules
          // when they are parked off to the sides), and an overflow-hidden
          // ancestor stops `position: sticky` from pinning to the viewport at
          // all. ScrollTrigger pins with `position: fixed`, which that ancestor
          // does not clip.
          trigger: stageEl,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Holds at both ends, so the pills are still parked and closed as the list
      // comes into view and again once it is leaving. Without them the scrub
      // spreads the open/close across the entire travel and the pills are
      // already half-open by the time they are on screen at all.
      const HOLD = 0.6; // closed, entering and leaving
      const MOVE = 1; // travel and open / close
      const PAUSE = 1.2; // open and centred — long enough to actually read

      tl.fromTo(
        items,
        { rotate: at("rot"), x: at("x"), y: at("y"), width: COLLAPSED_W },
        { rotate: 0, x: 0, y: 0, width: open, ease: "none", duration: MOVE },
        HOLD
      )
        .fromTo(
          texts,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.4 },
          HOLD + MOVE - 0.4
        )
        .to(texts, { opacity: 0, ease: "none", duration: 0.4 }, HOLD + MOVE + PAUSE)
        .to(
          items,
          {
            rotate: at("rot"),
            x: at("x"),
            y: at("y"),
            width: COLLAPSED_W,
            ease: "none",
            duration: MOVE,
          },
          HOLD + MOVE + PAUSE
        )
        // Pads the timeline so the trailing hold has somewhere to live.
        .to({}, { duration: HOLD }, HOLD + MOVE + PAUSE + MOVE);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="schedule-m"
      className="relative isolate overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--color-navy-deep) 0%, var(--color-navy) 62%, #0a5a99 100%)",
        padding: "clamp(4rem,8vw,7rem) 0",
      }}
    >
      {/* Warm accent wash — the same one the Manufacturing webinar panel uses */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(42% 55% at 90% 6%, rgba(247,148,30,0.24), transparent 68%)",
        }}
      />
      {/* Faint blueprint grid, so the section reads as a controlled environment */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(90% 70% at 50% 0%, #000, transparent 76%)",
          WebkitMaskImage: "radial-gradient(90% 70% at 50% 0%, #000, transparent 76%)",
        }}
      />

      <div ref={ref} className="relative mx-auto w-full max-w-[1320px] px-5 lg:px-8">
        {/* ── Pinned stage ────────────────────────────────────────────────
            Everything the capsule effect needs lives in here, and it is held
            still for the duration of that effect. `min-h-screen` + centring is
            what fills the pinned viewport; below `lg` the effect is off and
            this is an ordinary block. */}
        <div
          ref={stage}
          className="lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:pt-8"
        >
          <SectionHeading
            eyebrow="Schedule M · Regulatory Pressure"
            title="Compliance in Pharma"
            accent="Isn't Optional Anymore"
            tone="dark"
          />

        {/* Subheadline — set larger than a lede because it is the stake, not a
            description. Kept on the same 820px measure as the heading. */}
        <p
          data-reveal
          className="mx-auto mt-5 max-w-[820px] text-balance text-center leading-snug text-white"
          style={{ fontSize: "clamp(1.05rem,1.8vw,1.4rem)", fontWeight: 600 }}
        >
          Schedule M can keep your pharma business running smoothly, or bring it to a
          complete stop.{" "}
          <span style={{ color: "var(--color-orange-soft)" }}>There&rsquo;s no in-between.</span>
        </p>

        {/* ── What Schedule M expects ─────────────────────────────────── */}
        <p
          data-reveal
          className="eyebrow mt-14 text-center"
          style={{ color: "rgba(255,255,255,0.62)", letterSpacing: "0.2em" }}
        >
          What Schedule M actually expects from you
        </p>

        {/* Capsules, after the reference's stats section: a coloured left half,
            a light right half, fully rounded ends and a gloss band across the
            top.

            No `data-reveal` on these — the section-wide reveal writes its own
            opacity and y, which would fight the scrubbed capsule animation.
            `items-center` keeps them centred while they are closed and narrower
            than the list. */}
        {/* `w-full` is load-bearing: the pinned stage is a flex column, and
            `mx-auto` on a flex item suppresses stretch, so without it the list
            shrink-wraps its own collapsed pills — and `open()` reads that back
            as the width to open to, which pins the pills shut forever. */}
        <ul
          ref={pills}
          className="mx-auto flex w-full max-w-[900px] list-none flex-col items-center gap-4 pb-6 pt-12 lg:pt-16"
        >
          {EXPECTATIONS.map(({ n, icon: Icon, text }) => (
            <li
              key={n}
              className="group relative flex w-full items-stretch overflow-hidden rounded-full"
              style={{ boxShadow: "0 14px 34px -16px rgba(0,0,0,0.55)" }}
            >
              {/* Coloured half — carries the number, as the reference's carries
                  the figure. */}
              <span
                className="flex w-[68px] shrink-0 items-center justify-center sm:w-[92px]"
                style={{ background: "var(--color-orange)" }}
              >
                <span className="data-mono text-[15px] font-extrabold leading-none text-white sm:text-[17px]">
                  {n}
                </span>
              </span>

              {/* Light half — the expectation itself. */}
              <span className="flex min-w-0 flex-1 items-center gap-3 bg-white px-5 py-4 sm:gap-4 sm:px-6 sm:py-5">
                <Icon
                  size={19}
                  strokeWidth={2.1}
                  className="hidden shrink-0 sm:block"
                  style={{ color: "var(--color-navy)" }}
                />
                {/* `lg:whitespace-nowrap` holds the pill's height steady while
                    its width tweens — a wrapping line would change the height
                    on every frame of the open/close. */}
                <span
                  data-pill-text
                  className="text-[14px] font-semibold leading-snug text-ink sm:text-[15.5px] lg:whitespace-nowrap"
                >
                  {text}
                </span>
              </span>

              {/* Gloss, the reference's `bg-shine`: a soft band down the upper
                  third that reads as light catching a rounded surface. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.34), rgba(255,255,255,0))",
                }}
              />
            </li>
          ))}
        </ul>
        </div>
        {/* ── End of pinned stage. Everything below only arrives once the
            capsule effect has finished. ───────────────────────────────── */}

        {/* ── Official source ─────────────────────────────────────────── */}
        <div data-reveal className="mt-6 flex justify-center">
          <SecondaryButtonDark
            href={ROUTES.scheduleM}
            label={CTA_LABELS.scheduleM}
            external
            icon={<ExternalLink size={16} strokeWidth={2.3} />}
          />
        </div>

        {/* ── The real risk, and why ─────────────────────────────────────
            The first line is pulled out as a warning callout because it is the
            sentence that should stop someone scrolling; the rest carries the
            argument on a comfortable measure. */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div
            data-reveal
            className="self-start rounded-[18px] border-l-2 bg-white/8 p-6"
            style={{ borderLeftColor: "var(--color-orange)" }}
          >
            <p className="flex items-center gap-2.5">
              <AlertTriangle
                size={17}
                strokeWidth={2.3}
                style={{ color: "var(--color-orange-soft)" }}
              />
              <span
                className="eyebrow"
                style={{ color: "var(--color-orange-soft)", letterSpacing: "0.18em" }}
              >
                The real risk
              </span>
            </p>
            <p
              className="mt-4 text-balance leading-snug text-white"
              style={{ fontSize: "clamp(1.05rem,1.6vw,1.3rem)", fontWeight: 700 }}
            >
              Most pharma companies aren&rsquo;t prepared for the investigations or audits
              that can come up anytime. That&rsquo;s the real risk.
            </p>
          </div>

          <div data-reveal className="space-y-5">
            <p className="text-[15px] leading-relaxed text-white/80">
              Why? Because Schedule M wants one thing,{" "}
              <span className="font-semibold text-white">a systematic process</span>. A process
              that creates medicines and proves those medicines are safe. Simple.
            </p>
            <p className="text-[15px] leading-relaxed text-white/80">
              But that documentation only happens when the process itself is systematic. Data
              has to be captured as you go. Everything has to be easier to track, and detailed
              enough to hold up. When that&rsquo;s in place, documentation becomes easy to
              create. When it&rsquo;s not, most pharma companies fall behind, without even
              realizing it until an audit is at the door.
            </p>
            <p className="text-[15px] leading-relaxed text-white/80">
              The solution isn&rsquo;t 10 different systems patching different gaps. That just
              creates more headache, not less. The solution is one system that already has
              everything, the data, the process, every detail, smaller or bigger.{" "}
              <span className="font-semibold text-white">
                ERPNext brings all of that together, so documentation isn&rsquo;t extra work.
                It&rsquo;s already there.
              </span>
            </p>
          </div>
        </div>

        {/* ── Close ──────────────────────────────────────────────────────
            The page's last action. Filled primary, outlined secondary. */}
        <div
          data-reveal
          className="mt-14 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <PrimaryButton
            href={ROUTES.demo}
            label={CTA_LABELS.auditReady}
            size="lg"
            icon={<ArrowRight size={18} strokeWidth={2.4} />}
          />
          <SecondaryButton
            href={ROUTES.guide}
            label={CTA_LABELS.complianceGuide}
            size="lg"
            className="!border-white/25 !bg-white/8 !text-white hover:!border-white/50 hover:!bg-white/14 hover:!text-white"
          />
        </div>
      </div>
    </section>
  );
}
