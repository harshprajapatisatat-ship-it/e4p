"use client";

import {
  Boxes,
  FlaskConical,
  Factory,
  ShieldCheck,
  FileSignature,
  PackageCheck,
  BadgeCheck,
  Thermometer,
  ScrollText,
} from "lucide-react";
import { FlowChain } from "./visuals/FlowPrimitives";
import { StateChip } from "./PharmaUI";

/**
 * Hero visual — "Pharma manufacturing + ERP + compliance" as one composition.
 *
 * Deliberately not a stock photo. It is the actual thing being sold: a batch
 * record open in the system, its genealogy traced end to end, its documents
 * signed, its environment monitored. A slow scan line passes over the record so
 * it reads as live rather than as a screenshot.
 *
 * Built to sit beside the headline without competing with it — one panel, one
 * accent colour, generous internal whitespace, no gradient soup.
 */

const GENEALOGY = [
  { label: "Batch", icon: Boxes },
  { label: "Material", icon: FlaskConical },
  { label: "Production", icon: Factory },
  { label: "QC", icon: ShieldCheck },
  { label: "Approval", icon: FileSignature },
  { label: "Released", icon: PackageCheck, verified: true },
];

const DOCS = [
  { label: "Batch Manufacturing Record", id: "BMR-2411-0187" },
  { label: "Certificate of Analysis", id: "COA-2411-0187" },
  { label: "QA Release Statement", id: "REL-2411-0187" },
];

/**
 * Bottom data row. These four were originally two floating "satellite" cards
 * outside the panel — which overlapped the traceability chain and the document
 * list at desktop and tablet widths. Folding them into the panel as one 2×2 / 4-up
 * row removes the collision entirely and reads as part of the record, which is
 * more honest than decoration floating beside it.
 */
const FACTS = [
  // Labels are kept to two short words: four of these share the panel width, and
  // "Lots consumed" truncates at desktop.
  { label: "Lots used", value: "04", icon: Boxes, tone: "navy" as const },
  { label: "QC tests", value: "12", icon: ShieldCheck, tone: "teal" as const },
  { label: "Cold chain", value: "2 – 8 °C", icon: Thermometer, tone: "navy" as const },
  { label: "Audit trail", value: "Retained", icon: ScrollText, tone: "navy" as const },
];

export default function PharmaHeroVisual() {
  return (
    <div className="relative" aria-hidden>
      {/* Blueprint grid — the "controlled environment" ground the panel sits on.
          Faint enough to read as paper, not as a UI element. */}
      <span
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,68,124,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,68,124,0.07) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(70% 70% at 50% 45%, #000 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 45%, #000 30%, transparent 78%)",
        }}
      />

      {/* ── The record ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[20px] border border-line bg-white"
        style={{ boxShadow: "0 32px 70px -44px rgba(11,31,51,0.42)" }}
      >
        {/* Compliance read sweeping down the record */}
        <span
          className="record-scan pointer-events-none absolute inset-x-0 top-0 z-10 h-14"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(20,168,155,0.13) 55%, rgba(20,168,155,0.32))",
          }}
        />

        {/* Record header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="eyebrow" style={{ fontSize: "0.6rem", letterSpacing: "0.16em" }}>
              Batch Record
            </p>
            <p className="data-mono mt-0.5 truncate text-[15px] font-bold leading-tight text-ink">
              PH-2411-0187
            </p>
          </div>
          <StateChip label="Released" state="released" className="shrink-0" />
        </div>

        <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
          {/* Genealogy */}
          <div>
            <p className="eyebrow mb-2.5" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
              Traceability
            </p>
            <FlowChain nodes={GENEALOGY} dense />
          </div>

          {/* Documents */}
          <div className="rounded-[12px] border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
                Documentation
              </p>
              <span className="data-mono text-[10.5px] font-bold text-teal-deep">3 / 3 signed</span>
            </div>
            <ul className="mt-2.5 flex list-none flex-col gap-1.5">
              {DOCS.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-2.5 rounded-[9px] bg-white px-2.5 py-2"
                >
                  <BadgeCheck
                    size={14}
                    strokeWidth={2.3}
                    className="shrink-0"
                    style={{ color: "var(--state-released)" }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-tight text-ink">
                    {d.label}
                  </span>
                  <span className="data-mono hidden shrink-0 text-[10px] text-muted sm:block">
                    {d.id}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Facts row — 2×2 on narrow, 4-up once there is room */}
          <ul className="grid list-none grid-cols-2 gap-2.5 sm:grid-cols-4">
            {FACTS.map(({ label, value, icon: Icon, tone }) => {
              const teal = tone === "teal";
              return (
                <li
                  key={label}
                  className="flex flex-col gap-1.5 rounded-[12px] border border-line px-3 py-2.5"
                >
                  <span className="flex items-center gap-1.5">
                    <Icon
                      size={12}
                      strokeWidth={2.4}
                      className="shrink-0"
                      style={{ color: teal ? "var(--state-released)" : "var(--color-navy)" }}
                    />
                    <span className="truncate text-[9.5px] uppercase tracking-[0.09em] text-muted">
                      {label}
                    </span>
                  </span>
                  <span
                    className="data-mono block truncate text-[13px] font-extrabold leading-none"
                    style={{ color: teal ? "var(--state-released)" : "var(--color-ink)" }}
                  >
                    {value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
