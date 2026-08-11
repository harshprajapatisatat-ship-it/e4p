"use client";

import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  Warehouse,
  Gauge,
  GitPullRequest,
  FileSignature,
  CalendarClock,
  Search,
  Bell,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { StateChip } from "./PharmaUI";
import { Meter } from "./visuals/FlowPrimitives";

/**
 * The "app screen" band that sits under the hero.
 *
 * Structure is scriptrunner.ai's: the product screen inside a rounded, clipped
 * frame, in a `perspective: 1000px` wrapper, tilted back and levelled out as it
 * scrolls in. Theirs is a 3840px PNG export; ours is drawn in the same
 * code-native grammar as the rest of this page (state chips, meters, the shared
 * compliance colour semantics from globals.css) so it stays sharp at any density
 * and cannot go stale against a redesign of the real screen.
 *
 * The batch numbers, lot codes, counts and dates are illustrative sample data
 * for the diagram — the same set the challenge diagrams use — not customer
 * figures or capability claims.
 *
 * Note: the reference has a headline, a paragraph and a CTA below the screen.
 * Nothing is written in here, because no copy was supplied for this section.
 *
 * Vertical padding is tighter than the site-wide section rhythm — the screen is
 * meant to sit close under the hero, and the full clamp leaves a conspicuous
 * band of white between the two. The top is tighter than the bottom because the
 * tilted screen scales to 1.05, which visually adds space above it anyway.
 */

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Boxes, label: "Batches" },
  { icon: ShieldCheck, label: "Quality" },
  { icon: Warehouse, label: "Stock" },
  { icon: Gauge, label: "Equipment" },
  { icon: GitPullRequest, label: "Deviations" },
  { icon: FileSignature, label: "Documents" },
];

const KPIS = [
  { label: "Batches in production", value: "18", meta: "4 awaiting QA release" },
  { label: "QC checks due today", value: "31", meta: "across 9 batches" },
  { label: "Lots expiring in 30 days", value: "06", meta: "2 already blocked" },
  { label: "Open deviations", value: "03", meta: "all within CAPA dates" },
];

const BATCHES = [
  { id: "PH-2411-0187", product: "Paracetamol 500mg", stage: "Released", state: "released" as const, qc: "12 / 12" },
  { id: "PH-2411-0186", product: "Amoxicillin 250mg", stage: "QA review", state: "quarantine" as const, qc: "11 / 12" },
  { id: "PH-2411-0184", product: "Cetirizine 10mg", stage: "In-process QC", state: "controlled" as const, qc: "06 / 12" },
  { id: "PH-2411-0181", product: "Metformin 850mg", stage: "Quarantine", state: "quarantine" as const, qc: "09 / 12" },
  { id: "PH-2411-0179", product: "Ibuprofen 400mg", stage: "Rejected", state: "rejected" as const, qc: "10 / 12" },
];

const EXPIRY = [
  { item: "API — Paracetamol", lot: "RM-A-4471", life: 78, state: "released" as const },
  { item: "Excipient — Starch", lot: "RM-B-2280", life: 41, state: "released" as const },
  { item: "Printed foil", lot: "RM-C-1932", life: 12, state: "quarantine" as const },
  { item: "Tablets 500mg", lot: "FG-D-0771", life: 4, state: "rejected" as const },
];

const EQUIPMENT = [
  { name: "Blister Pack Line 02", next: "2026-11-02", state: "released" as const, tag: "Qualified" },
  { name: "Fluid Bed Dryer", next: "2026-09-19", state: "released" as const, tag: "Qualified" },
  { name: "Tablet Compression", next: "2026-08-24", state: "quarantine" as const, tag: "Cal. due" },
];

export default function PharmaDashboard() {
  const root = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const target = screen.current;
    if (!el || !target) return;

    // Reduced motion gets the levelled screen immediately — the tilt is
    // decoration, and settling it under the reader is exactly the kind of
    // movement the preference is asking us to drop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Rest state is measured off the reference: `scale(1.05) rotateX(20deg)`,
      // unwinding to identity, scrubbed to scroll. `ease: "none"` because the
      // scroll position *is* the timeline; the reference's own smoothing is a
      // 700ms CSS transition on transform, which `scrub: 0.7` reproduces.
      //
      // The range is a balance between two failure modes. The reference's own
      // (`top 33%` → `top top`) only lies flat once the screen fills the window,
      // which is a long scroll. Finishing early instead (`top 88%` → `top 38%`)
      // resolves the tilt while the screen is still entering from the bottom, so
      // by the time it is properly in view there is no animation left to see.
      //
      // The tilt is only legible while the screen is actually on-screen, so the
      // end has to sit late enough for the two to overlap: this runs until the
      // frame's top is near the top of the viewport — by which point the whole
      // screen is visible — while still settling before the reference does.
      gsap.fromTo(
        target,
        { rotateX: 20, scale: 1.05 },
        {
          rotateX: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "top 10%",
            scrub: 0.7,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-white px-5 pb-8 pt-4 lg:px-8 lg:pb-16 lg:pt-6">
      <div ref={root} className="mx-auto max-w-[1100px]" style={{ perspective: 1000 }}>
        <div
          ref={screen}
          className="overflow-hidden rounded-[22px] border border-line bg-white"
          style={{
            // Centre origin, as the reference uses — the screen pivots about its
            // middle rather than hinging from its top edge.
            willChange: "transform",
          }}
        >
          {/* ── App chrome ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
            <span aria-hidden className="flex shrink-0 gap-1.5">
              {["#e7eaee", "#e7eaee", "#e7eaee"].map((c, i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              ))}
            </span>
            <span className="data-mono truncate text-[11px] text-muted">
              erp.yourplant.in / app / pharma-manufacturing
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-3 text-muted">
              <Search size={14} strokeWidth={2.2} />
              <Bell size={14} strokeWidth={2.2} />
            </span>
          </div>

          <div className="flex">
            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <nav
              aria-hidden
              className="hidden w-[176px] shrink-0 flex-col gap-0.5 border-r border-line bg-surface p-3 sm:flex"
            >
              {NAV.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-semibold"
                  style={
                    active
                      ? { background: "rgba(247,148,30,0.12)", color: "var(--color-orange)" }
                      : { color: "var(--color-muted)" }
                  }
                >
                  <Icon size={14} strokeWidth={2.2} className="shrink-0" />
                  {label}
                </span>
              ))}
            </nav>

            {/* ── Screen body ──────────────────────────────────────────── */}
            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-extrabold leading-none tracking-tight text-ink">
                  Pharma Manufacturing
                </p>
                <StateChip label="Live" state="released" className="shrink-0" />
              </div>

              {/* KPI row */}
              <ul className="mt-4 grid list-none grid-cols-2 gap-2.5 lg:grid-cols-4">
                {KPIS.map((k) => (
                  <li key={k.label} className="rounded-[12px] border border-line px-3 py-2.5">
                    <span className="block truncate text-[10px] uppercase tracking-[0.09em] text-muted">
                      {k.label}
                    </span>
                    <span className="data-mono mt-1.5 block text-[20px] font-extrabold leading-none text-navy">
                      {k.value}
                    </span>
                    <span className="mt-1.5 block truncate text-[10.5px] leading-tight text-muted">
                      {k.meta}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                {/* Batch register */}
                <div className="rounded-[12px] border border-line">
                  <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
                    <span
                      className="eyebrow"
                      style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}
                    >
                      Batch Register
                    </span>
                    <span className="data-mono text-[10px] text-muted">QC passed</span>
                  </div>
                  <ul className="flex list-none flex-col">
                    {BATCHES.map((b) => (
                      <li
                        key={b.id}
                        className="flex items-center gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-bold leading-tight text-ink">
                            {b.product}
                          </span>
                          <span className="data-mono block truncate text-[10px] leading-tight text-muted">
                            {b.id} · {b.stage}
                          </span>
                        </span>
                        <span className="data-mono hidden shrink-0 text-[10.5px] text-muted sm:block">
                          {b.qc}
                        </span>
                        <StateChip label={b.stage} state={b.state} className="shrink-0" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Expiry watch */}
                  <div className="rounded-[12px] border border-line p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="eyebrow"
                        style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}
                      >
                        Shelf Life
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy">
                        <CalendarClock size={11} strokeWidth={2.4} />
                        FEFO
                      </span>
                    </div>
                    <ul className="mt-2.5 flex list-none flex-col gap-2">
                      {EXPIRY.map((e) => (
                        <li key={e.lot}>
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[11.5px] font-semibold leading-tight text-ink">
                              {e.item}
                            </span>
                            <span className="data-mono shrink-0 text-[9.5px] text-muted">
                              {e.lot}
                            </span>
                          </span>
                          <Meter value={e.life} tone={e.state} className="mt-1.5" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Equipment */}
                  <div className="rounded-[12px] border border-line p-3">
                    <span
                      className="eyebrow"
                      style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}
                    >
                      Equipment
                    </span>
                    <ul className="mt-2.5 flex list-none flex-col gap-2">
                      {EQUIPMENT.map((q) => (
                        <li key={q.name} className="flex items-center gap-2.5">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11.5px] font-semibold leading-tight text-ink">
                              {q.name}
                            </span>
                            <span className="data-mono block truncate text-[9.5px] leading-tight text-muted">
                              next {q.next}
                            </span>
                          </span>
                          <StateChip label={q.tag} state={q.state} className="shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
