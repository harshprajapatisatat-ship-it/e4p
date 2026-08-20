"use client";

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

/**
 * The four expectations, verbatim. The icon and the short lead-in label are the
 * only things added — the icon sits in the light half of the capsule, next to
 * the line itself, so each step is readable at a glance from the tilt it sits
 * at.
 */
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
 * Where each capsule sits once the layout goes two-sided, and the rail that
 * threads them together.
 *
 * Four capsules, alternating sides, 200px apart vertically. The tilt is 3°, not
 * the reference's 8°: a capsule is a long shape, so it sweeps `width·sinθ`
 * vertically as it rotates — 22px here, comfortably inside the 104px gap between
 * one capsule's bottom and the next one's top. At 8° it would sweep 60px and
 * start crowding the rail it is supposed to hang off.
 */
const STEP_LAYOUT = [
  { className: "lg:absolute lg:left-[4%] lg:top-0", rotate: "lg:rotate-3" },
  { className: "lg:absolute lg:right-[4%] lg:top-[200px]", rotate: "lg:-rotate-3" },
  { className: "lg:absolute lg:left-[4%] lg:top-[400px]", rotate: "lg:rotate-3" },
  { className: "lg:absolute lg:right-[4%] lg:top-[600px]", rotate: "lg:-rotate-3" },
];

/** Stage height in viewBox units. Mirrored by `lg:h-[700px]` on the stage. */
const RAIL_H = 700;

/**
 * The dashed rail, drawn in the same 1000×700 space the capsules are positioned
 * in: left capsules are centred on x=255 (4% + half of 43%), right ones on
 * x=745, and a 96px capsule at `top` spans y=`top`..`top+96`.
 *
 * Three separate subpaths rather than one continuous line, because the run from
 * capsule 2 back to capsule 3 would otherwise be drawn straight through capsule
 * 2 itself. Each leg leaves the bottom of one capsule and arrives at the top of
 * the next, bowing out so the crossing reads as a route rather than a diagonal.
 */
const RAIL_D = [
  "M 255 96 C 255 165, 745 130, 745 200",
  "M 745 296 C 745 365, 255 330, 255 400",
  "M 255 496 C 255 565, 745 530, 745 600",
].join(" ");

export default function PharmaScheduleM() {
  // This section has the most `data-reveal` children on the page. At the
  // site-wide 0.12 stagger the last card would still be arriving ~1.6s after the
  // first, so the stagger is tightened here to keep it on screen inside ~1s.
  const ref = useReveal<HTMLDivElement>({ y: 26, stagger: 0.055, duration: 0.85 });
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
        <SectionHeading
          eyebrow="Schedule M · Regulatory Pressure"
          title="Compliance in Pharma"
          accent="Isn't Optional Anymore"
          tone="dark"
        />

        {/* Subheadline — set larger than a lede because it is the stake, not
            a description. Kept on the same 820px measure as the heading. */}
        <p
          data-reveal
          className="mx-auto mt-5 max-w-[820px] text-balance text-center leading-snug text-white"
          style={{ fontSize: "clamp(1.05rem,1.8vw,1.4rem)", fontWeight: 600 }}
        >
          Schedule M can keep your pharma business running smoothly, or bring it to a
          complete stop.{" "}
          <span style={{ color: "var(--color-orange-soft)" }}>
            There&rsquo;s no in-between.
          </span>
        </p>

        {/* ── What Schedule M expects ─────────────────────────────── */}
        <p
          data-reveal
          className="eyebrow mt-14 text-center"
          style={{ color: "rgba(255,255,255,0.62)", letterSpacing: "0.2em" }}
        >
          What Schedule M actually expects from you
        </p>

        {/* ── The four expectations, threaded on one path ──────────────────
            Replaces the pinned capsule choreography this section used to run.
            The shape is the "how it works" pattern — steps alternating left and
            right, each tilted a few degrees, joined by a dashed rail that crawls
            from one to the next — but the step itself stays the CAPSULE this
            section already used, not the pinned sticky note the reference draws.
            A pharma compliance section should not read as a corkboard.

            Geometry is expressed in PERCENTAGES, not pixels, and that is what
            makes the rail line up with the capsule ends. The SVG stretches with
            `preserveAspectRatio="none"`, so a capsule pinned at `left-[4%]` with
            `w-[43%]` holds its centre at 25.5% of the box at every width —
            exactly the `x=255` the path is drawn through. Pin one in pixels
            instead and the rail slides off its ends as the viewport changes.

            Below `lg` the two-sided idea is off entirely: there is no room
            either side of a 430px capsule, so the rail is hidden and the
            capsules are an ordinary centred stack — the same breakpoint the old
            effect gated on. */}
        <div className="relative mx-auto mt-12 w-full max-w-[1000px] lg:mt-16 lg:h-[700px]">
          {/* The 700px height is stated twice — here as a Tailwind arbitrary
              value, and again as RAIL_H in the viewBox — because a Tailwind
              class cannot read a JS constant. Edit the two together. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox={`0 0 1000 ${RAIL_H}`}
            preserveAspectRatio="none"
          >
            <path
              d={RAIL_D}
              className="step-rail"
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ul className="relative z-10 flex w-full list-none flex-col items-center gap-4 lg:block lg:gap-0">
            {EXPECTATIONS.map(({ n, icon: Icon, text }, i) => {
              const pos = STEP_LAYOUT[i];
              // The capsules take a fixed `min-h` rather than their natural
              // height: 03 is the one line long enough to wrap to three, and a
              // taller shell would carry its ends off the rail, which is drawn
              // against a 96px capsule.
              return (
                <li
                  key={n}
                  data-reveal
                  className={`w-full max-w-[430px] lg:w-[43%] lg:max-w-none ${pos.className}`}
                >
                  {/* The tilt lives on this wrapper rather than on the <li>: the
                      <li> is what `data-reveal` animates, and the section reveal
                      writes its own transform there. Splitting the two keeps the
                      rotation out of the reveal's way entirely. */}
                  <div
                    className={`relative flex items-stretch overflow-hidden rounded-full ${pos.rotate} lg:min-h-[96px]`}
                    style={{
                      boxShadow:
                        "0 18px 38px -18px rgba(0,0,0,0.62), 0 2px 5px -2px rgba(0,0,0,0.35)",
                    }}
                  >
                    {/* Coloured half — carries the number, as the reference's
                        carries the figure. Flat brand orange: no fill gradient, no
                        seam shading, and the gloss below is scoped to the light
                        half so nothing washes over this. */}
                    <span
                      className="relative flex w-[104px] shrink-0 items-center justify-center sm:w-[124px]"
                      style={{ background: "var(--color-orange)" }}
                    >
                      <span
                        className="data-mono font-extrabold leading-none text-white"
                        style={{
                          fontSize: "clamp(20px,2vw,25px)",
                          letterSpacing: "-0.02em",
                          textShadow: "0 1px 2px rgba(0,0,0,0.22)",
                        }}
                      >
                        {n}
                      </span>
                    </span>

                    {/* Light half — the expectation itself, wrapping to two lines
                        the way the reference's label does. Nothing here animates:
                        it is readable from the first frame to the last. */}
                    <span
                      className="relative flex min-w-0 flex-1 items-center gap-3 px-5 py-5 sm:px-5"
                      style={{
                        background: "linear-gradient(178deg, #ffffff 0%, #f2f5f7 58%, #dfe5ea 100%)",
                      }}
                    >
                      {/* Gloss, the reference's `bg-shine`: a soft band down the
                          upper half, brightest just under the top edge. Lives
                          inside the light half rather than across the whole shell,
                          so the number's orange stays flat. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.16), rgba(255,255,255,0.42) 26%, rgba(255,255,255,0))",
                        }}
                      />
                      <Icon
                        size={18}
                        strokeWidth={2.1}
                        className="hidden shrink-0 sm:block"
                        style={{ color: "var(--color-navy)" }}
                      />
                      <span className="text-[13px] font-semibold leading-[1.35] text-ink sm:text-[13.5px]">
                        {text}
                      </span>
                    </span>

                    {/* Shell edge — a hairline of light around the rim, so the
                        capsule sits on the navy instead of being cut out of it. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full"
                      style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.75)" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Official source ─────────────────────────────────────────────
            Opens the CDSCO document itself in a new tab, so the section points
            at the regulation rather than at anyone's summary of it. */}
        <div data-reveal className="mt-14 flex justify-center">
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
            href={ROUTES.contact}
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
