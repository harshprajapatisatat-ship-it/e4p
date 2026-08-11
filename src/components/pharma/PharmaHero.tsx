"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { PrimaryButton, SecondaryButtonDark } from "./PharmaUI";
import { ROUTES, CTA_LABELS } from "@/lib/routes";

/**
 * Hero — headline, subheadline and the two CTAs, over a full-cover video.
 *
 * The structure is the one used by scriptrunner.ai's hero, which the client
 * asked us to match: a rounded, inset section that clips its contents, the clip
 * absolutely covering it, a radial scrim above the clip, and the copy above
 * both. Layering is by z-index in that order — video, scrim (z-20), copy (z-30).
 *
 * Two deliberate departures from that reference:
 *
 *  - The scrim is our navy, not black, and carries the same warm top-right
 *    accent as every other section on the site, so the hero reads as part of
 *    this brand rather than as a borrowed component.
 *  - Their hero starts at the very top of the page under a transparent nav.
 *    Ours sits below the 72px white header bar, which is shared verbatim with
 *    the Manufacturing site and is not ours to make transparent.
 *
 * Entrance is the same GSAP pattern the Manufacturing hero uses: one timeline,
 * `gsap.context` scoped to the section root, reverted on unmount.
 */

const VIDEO = "/pharma/pharma-hero.mp4";
const POSTER = "/pharma/pharma-hero.jpg";

export default function PharmaHero() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
      tl.fromTo("[data-ph-h1]", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85 })
        .fromTo("[data-sub]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.55")
        .fromTo("[data-ph-cta]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4");
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Autoplaying motion is opt-out for anyone who has asked the OS for less of
    // it. The poster frame stays, so the hero still reads as intended.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) v.pause();
      else void v.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section ref={root} className="pharma-hero px-4 pb-4 pt-[calc(72px+1rem)]">
      {/* `isolate` keeps the z-20/z-30 stack local to the hero, so it can never
          climb over the fixed header. */}
      <div
        className="relative isolate flex h-[600px] flex-col items-center justify-center overflow-hidden rounded-[24px] px-6 py-8 lg:h-[min(calc(100vh-104px),880px)] lg:px-16"
        style={{ background: "var(--color-navy-deep)" }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={POSTER}
          aria-hidden
          className="absolute left-0 top-0 h-full w-full object-cover"
        >
          <source src={VIDEO} type="video/mp4" />
        </video>

        {/* Scrim, in three layers.

            The reference gets away with a single radial because its footage is
            dark. Ours is a brightly-lit pharmacy — the lab coat sits directly
            behind the subheadline — so a flat navy tint goes underneath the
            radial to hold body copy at roughly 4.5:1 against the brightest
            frame. Measured against the poster frame; re-check it if the clip is
            ever swapped for a lighter one. */}
        <span
          aria-hidden
          className="absolute inset-0 z-20"
          style={{ background: "rgba(6,47,84,0.45)" }}
        />
        {/* Same geometry as the reference — transparent at the top right, solid
            at the far edges — so the subject stays visible behind the copy. */}
        <span
          aria-hidden
          className="absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(125.76% 77.84% at 77.74% 0%, rgba(6,47,84,0) 0%, var(--color-navy-deep) 100%)",
            opacity: 0.7,
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(42% 55% at 88% 6%, rgba(247,148,30,0.22), transparent 68%)",
          }}
        />

        {/* ── Copy ─────────────────────────────────────── */}
        <div className="relative z-30 flex w-full max-w-[960px] flex-col items-center gap-7 text-center text-white">
          <h1 data-ph-h1 className="display-lg text-balance">
            Making Pharma Simpler, Safer, and{" "}
            <span style={{ color: "var(--color-orange-soft)" }}>Audit-Ready</span>
          </h1>

          <p
            data-sub
            className="text-balance leading-relaxed text-white/90"
            style={{ fontSize: "clamp(0.95rem,1.15vw,1.075rem)", maxWidth: "62ch" }}
          >
            Pharma is more than manufacturing medicines. It&rsquo;s about compliance, quality,
            traceability, documentation, and strict regulatory processes. ERPNext brings every
            critical operation together in one system, helping you simplify complexity while
            staying audit-ready.
          </p>

          <div
            data-ph-cta
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
          >
            <PrimaryButton
              href={ROUTES.demo}
              label={CTA_LABELS.demo}
              size="lg"
              icon={<ArrowRight size={18} strokeWidth={2.4} />}
            />
            <SecondaryButtonDark href={ROUTES.guide} label={CTA_LABELS.guide} size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
