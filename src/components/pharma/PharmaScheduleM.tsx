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
import { gsap, ScrollTrigger } from "@/lib/gsap";
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
 * only things added — the label is what the reference puts in the light half of
 * its capsules, and it gives the eye something to read at a glance while the
 * capsule is still tilted and moving.
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
 * The capsule choreography, taken frame by frame off the reference.
 *
 * Its capsules are COMPACT and FIXED — around 310px wide, two short lines of
 * copy in the light half — and they never resize, never fade and are legible
 * from the first frame to the last. All that changes is where they are: they
 * start scattered low and steeply tilted, rise while rotating to level and
 * sliding in to a centred column, hold there, then drift back out and upward
 * still tilting away. Everything is scrubbed off scroll, so it reads as one
 * continuous movement rather than an entrance.
 *
 * A fixed 430px capsule is what makes the steep angles possible: a pill rotated
 * by θ sweeps `width·sinθ` vertically, so at 21° this one sweeps 154px — clear
 * of its neighbours while they are still fanned apart, and back to nothing by
 * the time the column closes up. A full-bleed 900px pill could not tilt past
 * ~4.5° without colliding, which is the whole reason the capsules are short.
 *
 * Offsets are fractions of the viewport, not pixels, so the scatter reaches the
 * same way into the edges of a 1280 laptop and a 2560 display. `yIn` is
 * positive (they come up from below the fold) and `yOut` negative (they leave
 * over the top) — the reference's entrance and exit are mirrored in x and
 * rotation but not in y, because the whole group is travelling upward.
 *
 * `yOut` is modest because the exit runs while the stage is scrolling away, so
 * the page is already carrying the capsules upward — this is only the extra
 * lift that gets them off the top before the closing copy needs the room.
 */
const SCATTER = [
  { rot: -21, xf: -0.3, yIn: 0.4, yOut: -0.34 },
  { rot: 18, xf: 0.32, yIn: 0.52, yOut: -0.28 },
  { rot: -16, xf: -0.28, yIn: 0.64, yOut: -0.24 },
  { rot: 22, xf: 0.31, yIn: 0.76, yOut: -0.2 },
];

export default function PharmaScheduleM() {
  // This section has the most `data-reveal` children on the page. At the
  // site-wide 0.12 stagger the last card would still be arriving ~1.6s after the
  // first, so the stagger is tightened here to keep it on screen inside ~1s.
  const ref = useReveal<HTMLDivElement>({ y: 26, stagger: 0.055, duration: 0.85 });
  const pills = useRef<HTMLUListElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const outro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pills.current;
    const stageEl = stage.current;
    const headEl = head.current;
    const outroEl = outro.current;
    if (!el || !stageEl) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("li"));
    if (!items.length) return;

    // Desktop only, and gated with `matchMedia` rather than a one-off check on
    // mount. Below `lg` there is no room either side of a 430px capsule to
    // scatter into and the capsules take the full measure, so the section is a
    // plain stacked list — no pin, no scrub, no transforms, the pills just sit
    // there. The live gate matters because the check has to survive a resize or
    // a tablet rotating to portrait: a mount-once check would leave the pills
    // frozen wherever the last desktop frame put them, tilted and parked off to
    // the side. GSAP reverts everything set up in here the moment the query
    // stops matching — inline transforms, ScrollTriggers and the pin spacer —
    // and sets it all up again if it matches later.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      // Scattered low and tilted → level and stacked → scattered high and tilted,
      // scrubbed across the whole time the list is on screen. Nothing resizes and
      // nothing fades: the reference's capsules are fully opaque and fully
      // readable throughout, and the travel itself is the entrance.
      //
      // Function-based values so a resize re-reads them; paired with
      // invalidateOnRefresh below.
      const s = (i: number) => SCATTER[i % SCATTER.length];
      const rotIn = (i: number) => s(i).rot;
      // A capsule leaves the way it arrived — same side, same tilt. That is what
      // the reference does: only the vertical direction reverses, because the
      // whole group is travelling upward the entire time.
      const rotOut = (i: number) => s(i).rot * 0.9;
      const xIn = (i: number) => s(i).xf * window.innerWidth;
      const xOut = (i: number) => s(i).xf * 0.85 * window.innerWidth;
      const yIn = (i: number) => s(i).yIn * window.innerHeight;
      const yOut = (i: number) => s(i).yOut * window.innerHeight;

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
          end: () => "+=" + window.innerHeight * 1.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // Pins shift every document position below them, so this one has to
          // recompute before the exit trigger measures itself.
          refreshPriority: 1,
        },
      });

      // HOLD keeps the capsules parked while the pin is still settling, so the
      // travel does not start before the section has actually stopped moving.
      // PAUSE is the beat where the column stands level and square — the shot
      // the section exists for, and the state the pin releases in.
      const HOLD = 0.35;
      const MOVE = 1;
      const PAUSE = 0.9;
      // How far the column climbs into the space the heading vacates, as a
      // fraction of the heading's height. Shared with the gap-closing pull at
      // the bottom of this setup — the two have to stay in step.
      const RISE = 0.55;
      // The reference's capsules do not arrive in lockstep; the lowest one is
      // still climbing when the top one has already landed.
      const STAGGER = 0.09;

      tl.fromTo(
        items,
        {
          rotate: rotIn,
          x: xIn,
          y: yIn,
          // A touch larger while scattered, so they read as nearer the viewer
          // out at the edges and settle back as the column closes up.
          scale: 1.06,
        },
        {
          rotate: 0,
          x: 0,
          y: 0,
          scale: 1,
          ease: "none",
          duration: MOVE,
          stagger: STAGGER,
        },
        HOLD
      )
        // Pads the timeline so the settled beat has somewhere to live. The pin
        // releases with the column standing level and square.
        .to({}, { duration: PAUSE }, HOLD + MOVE + STAGGER * (items.length - 1));

      // The heading leaves while the capsules are still climbing, so by the
      // time the column is level it is alone in the frame — and the column
      // rises into the space it vacated, which is what puts the settled stack
      // in the middle of the pinned viewport rather than down in the lower
      // third where the layout parks it.
      if (headEl) {
        tl.fromTo(
          headEl,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -70, ease: "none", duration: MOVE * 0.7 },
          HOLD + MOVE * 0.25
        ).fromTo(
          el,
          { y: 0 },
          { y: () => -headEl.offsetHeight * RISE, ease: "none", duration: MOVE },
          HOLD
        );

      }

      // ── The exit, deliberately NOT on the pin ────────────────────────────
      // The pinned stage is a full viewport tall and, once the heading has
      // faded, completely empty. If the capsules left while the pin was still
      // holding, that empty viewport would then scroll past on its own — a dead
      // screen of navy between the effect and the rest of the section.
      //
      // So the exit is driven by the stage scrolling away instead: it starts as
      // the source link below comes up over the fold and finishes once that
      // link is near the top of the screen. The capsules fly out through
      // exactly the stretch that would otherwise be empty, and the closing copy
      // arrives underneath them — which is what the reference does when its
      // white section slides up behind its own capsules.
      if (outroEl) {
        gsap.timeline({
          scrollTrigger: {
            trigger: outroEl,
            start: "top bottom",
            // Runs until the link is well up the screen. Anything earlier and
            // the capsules are gone with a stretch of empty navy still to
            // scroll before the closing copy arrives.
            end: "top 22%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).fromTo(
          items,
          { rotate: 0, x: 0, y: 0, scale: 1 },
          {
            rotate: rotOut,
            x: xOut,
            y: yOut,
            scale: 1.06,
            ease: "none",
            duration: 1,
            stagger: { each: 0.12, from: "end" },
          }
        );
      }

      // ── Closing the gap the rise leaves behind ───────────────────────────
      // The column's rise is a transform, so the stage's box does not shrink
      // with it — it just opens an equal band of empty navy under the capsules,
      // which is then what sits between them and the source link. Pull the rest
      // of the section up by exactly that much to take it back.
      //
      // Recomputed on every ScrollTrigger refresh so it survives a resize
      // reflowing the heading to a different height, and torn down with the
      // rest of the desktop setup when the media query stops matching.
      if (headEl && outroEl) {
        // Take back the rise, then re-add the breathing room the layout wants
        // between the column and the link — the inline margin replaces the
        // element's own `mt-6`, so the spacing has to be restated here.
        const GAP = 64;
        const closeGap = () =>
          gsap.set(outroEl, { marginTop: GAP - headEl.offsetHeight * RISE });
        closeGap();
        ScrollTrigger.addEventListener("refreshInit", closeGap);
        return () => ScrollTrigger.removeEventListener("refreshInit", closeGap);
      }
    });

    return () => mm.revert();
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
        {/* Anchored to the top of the pinned viewport, not centred in it. The
            heading is the tallest thing here and it is the thing that has to
            clear the fixed header on a short laptop screen; centring pushes it
            up underneath the header as soon as the content is taller than the
            viewport. Anchoring it instead means the settled column lands in the
            middle of the frame by way of the rise it takes when the heading
            clears out — which is the reference's composition anyway. */}
        <div
          ref={stage}
          className="lg:flex lg:min-h-screen lg:flex-col lg:justify-start lg:pt-28"
        >
          {/* The heading block clears out as the capsules converge, exactly as
              the reference's does, so the level column gets the pinned frame to
              itself and nothing is in the way when the capsules drift back up
              and over this space on the way out. Tweened on the wrapper, not on
              the `data-reveal` children, so it never fights the section reveal. */}
          <div ref={head}>
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
          </div>

        {/* Capsules, after the reference's stats section: a coloured left half
            carrying the number, a light right half carrying the line, fully
            rounded ends, and a specular band across the top that reads as light
            catching a rounded shell.

            The width is FIXED at 430px rather than filling the measure. That is
            the single decision the whole effect rests on — a short capsule can
            be tilted 21° and still clear its neighbours, and it can be read at
            any point in the travel, so nothing has to open, close or fade.

            No `data-reveal` on these — the section-wide reveal writes its own
            opacity and y, which would fight the scrubbed capsule animation. */}
        <ul
          ref={pills}
          className="mx-auto flex w-full list-none flex-col items-center gap-4 pb-6 pt-12 lg:gap-4 lg:pb-0 lg:pt-10"
        >
          {EXPECTATIONS.map(({ n, icon: Icon, text }) => {
            // The capsules take a fixed `min-h` rather than their natural
            // height: 03 is the one line long enough to wrap to three, and a
            // taller shell in the middle of the stack breaks the rhythm the
            // settled column depends on.
            return (
              <li
                key={n}
                className="relative flex w-full max-w-[430px] items-stretch overflow-hidden rounded-full will-change-transform lg:min-h-[96px]"
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
              </li>
            );
          })}
        </ul>
        </div>
        {/* ── End of pinned stage. Everything below only arrives once the
            capsule effect has finished. ───────────────────────────────── */}

        {/* ── Official source ─────────────────────────────────────────────
            Opens the CDSCO document itself in a new tab, so the section points
            at the regulation rather than at anyone's summary of it.

            Doubles as the trigger for the capsule exit: this block coming up
            over the fold is what drives the capsules out of the frame. */}
        <div ref={outro} data-reveal className="mt-6 flex justify-center">
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
