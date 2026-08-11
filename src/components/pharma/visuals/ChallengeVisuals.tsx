"use client";

import {
  Boxes,
  FlaskConical,
  Factory,
  ShieldCheck,
  PackageCheck,
  FileSignature,
  Snowflake,
  Thermometer,
  Gauge,
  Wrench,
  BadgeCheck,
  SearchCheck,
  ClipboardList,
  FileWarning,
  Lock,
  ScrollText,
} from "lucide-react";
import { StateChip } from "../PharmaUI";
import { DiagramPanel, FlowChain, FlowLadder, Meter } from "./FlowPrimitives";

/**
 * One diagram per challenge. Each is a small, honest slice of what the record
 * actually looks like when the process is systematic — a batch genealogy, an
 * approval chain, a set of QC gates, a zone map — drawn from the shared flow
 * grammar in FlowPrimitives so the eight of them read as one system.
 *
 * The identifiers, dates and counts are illustrative sample data for the
 * diagram, not customer figures or capability claims.
 */

/* ── 01 · Batch traceability ─────────────────────────────────────────────── */

/**
 * Metas are kept to one or two words on purpose: six nodes share the width of
 * one card column, so anything longer wraps to three lines and the chain stops
 * reading as a flow. The batch number is not repeated here — it is already the
 * panel's own label.
 */
const GENEALOGY = [
  { label: "Batch", meta: "Opened", icon: Boxes },
  { label: "Raw Material", meta: "4 lots", icon: FlaskConical },
  { label: "Production", meta: "3 stages", icon: Factory },
  { label: "QC", meta: "12 tests", icon: ShieldCheck },
  { label: "Approval", meta: "QA signed", icon: FileSignature },
  { label: "Finished", meta: "Released", icon: PackageCheck, verified: true },
];

export function TraceabilityVisual() {
  return (
    <DiagramPanel
      label="Batch Genealogy · PH-2411-0187"
      right={<StateChip label="Released" state="released" />}
    >
      <FlowChain nodes={GENEALOGY} className="gap-0" />
    </DiagramPanel>
  );
}

/* ── 02 · Documentation ──────────────────────────────────────────────────── */

const RECORDS = [
  { id: "BMR-2411-0187", name: "Batch Manufacturing Record", by: "Production", done: true },
  { id: "BPR-2411-0187", name: "Batch Packaging Record", by: "Packaging", done: true },
  { id: "COA-2411-0187", name: "Certificate of Analysis", by: "Quality Control", done: true },
  { id: "REL-2411-0187", name: "QA Release Statement", by: "Quality Assurance", done: false },
];

export function DocumentationVisual() {
  return (
    <DiagramPanel
      label="Batch Document Set"
      right={
        <span className="data-mono text-[10.5px] font-bold text-navy">3 / 4 signed</span>
      }
    >
      <ul className="flex list-none flex-col gap-2">
        {RECORDS.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-[10px] border border-line bg-white px-3 py-2.5"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
              style={{
                background: r.done ? "var(--state-released-bg)" : "var(--state-quarantine-bg)",
              }}
            >
              {r.done ? (
                <BadgeCheck
                  size={14}
                  strokeWidth={2.3}
                  style={{ color: "var(--state-released)" }}
                />
              ) : (
                <FileSignature
                  size={14}
                  strokeWidth={2.3}
                  style={{ color: "var(--state-quarantine)" }}
                />
              )}
            </span>
            {/* The record names are the longest strings in any diagram
                ("Batch Manufacturing Record"), so they wrap rather than
                truncate — a half-shown record name is worse than two lines. */}
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold leading-snug text-ink">
                {r.name}
              </span>
              <span className="data-mono block truncate text-[10px] leading-tight text-muted">
                {r.id} · {r.by}
              </span>
            </span>
            <StateChip
              label={r.done ? "Signed" : "Pending"}
              state={r.done ? "released" : "quarantine"}
              className="shrink-0"
            />
          </li>
        ))}
      </ul>
    </DiagramPanel>
  );
}

/* ── 03 · Product quality ────────────────────────────────────────────────── */

const QC_GATES = [
  { label: "Raw Material", meta: "Incoming", icon: FlaskConical, checks: 4 },
  { label: "In-Process", meta: "Per stage", icon: Factory, checks: 5 },
  { label: "Finished Goods", meta: "Final", icon: ShieldCheck, checks: 3 },
  { label: "Release", meta: "QA gate", icon: BadgeCheck, checks: 1, verified: true },
];

export function QualityVisual() {
  return (
    <DiagramPanel
      label="Quality Checkpoints"
      right={<StateChip label="13 tests" state="controlled" />}
    >
      <FlowChain nodes={QC_GATES} dense />
      {/* Per-stage check counters, aligned under the chain once it is horizontal */}
      <ul className="mt-3 hidden list-none grid-cols-4 gap-2 sm:grid">
        {QC_GATES.map((g) => (
          <li key={g.label} className="flex items-center justify-center gap-1" aria-hidden>
            {Array.from({ length: g.checks }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: g.verified
                    ? "var(--state-released)"
                    : "rgba(0,68,124,0.35)",
                }}
              />
            ))}
          </li>
        ))}
      </ul>
    </DiagramPanel>
  );
}

/* ── 04 · Inventory & expiry ─────────────────────────────────────────────── */

const LOTS = [
  { lot: "RM-A-4471", item: "API — Paracetamol", expiry: "2027-02-18", life: 78, state: "released" as const, tag: "Released" },
  { lot: "RM-B-2280", item: "Excipient — Starch", expiry: "2026-09-04", life: 41, state: "released" as const, tag: "Released" },
  { lot: "RM-C-1932", item: "Printed foil", expiry: "2026-08-30", life: 12, state: "quarantine" as const, tag: "Expiring" },
  { lot: "FG-D-0771", item: "Tablets 500mg", expiry: "2026-08-14", life: 4, state: "rejected" as const, tag: "Blocked" },
];

export function ExpiryVisual() {
  return (
    <DiagramPanel
      label="Lot Register · Shelf Life"
      right={<StateChip label="FEFO" state="controlled" />}
    >
      <ul className="flex list-none flex-col gap-2">
        {LOTS.map((l) => (
          <li key={l.lot} className="rounded-[10px] border border-line bg-white px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-bold leading-tight text-ink">
                  {l.item}
                </span>
                <span className="data-mono block truncate text-[10px] leading-tight text-muted">
                  {l.lot} · exp {l.expiry}
                </span>
              </span>
              <StateChip label={l.tag} state={l.state} className="shrink-0" />
            </div>
            <Meter value={l.life} tone={l.state} className="mt-2" />
          </li>
        ))}
      </ul>
    </DiagramPanel>
  );
}

/* ── 05 · Warehouse control ──────────────────────────────────────────────── */

const ZONES = [
  { name: "Quarantine", code: "QTN-01", items: 34, cond: "25 °C / 60% RH", state: "quarantine" as const, icon: Lock },
  { name: "Released", code: "REL-02", items: 128, cond: "25 °C / 60% RH", state: "released" as const, icon: BadgeCheck },
  { name: "Rejected", code: "REJ-01", items: 6, cond: "Locked area", state: "rejected" as const, icon: FileWarning },
  { name: "Samples", code: "SMP-01", items: 41, cond: "Retention store", state: "controlled" as const, icon: FlaskConical },
  { name: "Cold Chain", code: "CLD-01", items: 19, cond: "2 – 8 °C", state: "controlled" as const, icon: Snowflake },
  { name: "Finished Goods", code: "FG-03", items: 212, cond: "25 °C / 60% RH", state: "released" as const, icon: PackageCheck },
];

export function WarehouseVisual() {
  return (
    <DiagramPanel
      label="Storage Locations"
      right={
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-navy">
          <Thermometer size={12} strokeWidth={2.4} />
          Monitored
        </span>
      }
    >
      <ul className="grid list-none grid-cols-2 gap-2 sm:grid-cols-3">
        {ZONES.map((z) => {
          const Icon = z.icon;
          return (
            <li
              key={z.code}
              className="rounded-[10px] border bg-white px-2.5 py-2.5"
              style={{ borderColor: `var(--state-${z.state})`, borderLeftWidth: 3 }}
            >
              <span className="flex items-center gap-1.5">
                <Icon
                  size={12}
                  strokeWidth={2.4}
                  className="shrink-0"
                  style={{ color: `var(--state-${z.state})` }}
                />
                <span className="truncate text-[11.5px] font-bold leading-tight text-ink">
                  {z.name}
                </span>
              </span>
              <span className="data-mono mt-1 block truncate text-[9.5px] leading-tight text-muted">
                {z.code} · {z.items} items
              </span>
              <span className="mt-1 block truncate text-[10px] leading-tight text-muted">
                {z.cond}
              </span>
            </li>
          );
        })}
      </ul>
    </DiagramPanel>
  );
}

/* ── 06 · Equipment maintenance & validation ─────────────────────────────── */

const EQUIPMENT = [
  { name: "Blister Pack Line 02", code: "EQ-BPL-02", cal: 86, next: "2026-11-02", state: "released" as const, tag: "Qualified" },
  { name: "Fluid Bed Dryer", code: "EQ-FBD-01", cal: 34, next: "2026-09-19", state: "released" as const, tag: "Qualified" },
  { name: "Tablet Compression", code: "EQ-TCP-04", cal: 9, next: "2026-08-24", state: "quarantine" as const, tag: "Cal. due" },
];

const EQ_CYCLE = [
  { label: "Equipment", icon: Wrench },
  { label: "Calibration", icon: Gauge },
  { label: "Validation", icon: ShieldCheck },
  { label: "Maintenance", icon: ClipboardList },
  { label: "Compliance", icon: BadgeCheck, verified: true },
];

export function EquipmentVisual() {
  return (
    <DiagramPanel
      label="Equipment Status"
      right={<StateChip label="1 due" state="quarantine" />}
    >
      <ul className="flex list-none flex-col gap-2">
        {EQUIPMENT.map((e) => (
          <li key={e.code} className="rounded-[10px] border border-line bg-white px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-bold leading-tight text-ink">
                  {e.name}
                </span>
                <span className="data-mono block truncate text-[10px] leading-tight text-muted">
                  {e.code} · next {e.next}
                </span>
              </span>
              <StateChip label={e.tag} state={e.state} className="shrink-0" />
            </div>
            <Meter value={e.cal} tone={e.state} className="mt-2" />
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-line pt-3">
        <FlowChain nodes={EQ_CYCLE} dense />
      </div>
    </DiagramPanel>
  );
}

/* ── 07 · Change control & deviations ────────────────────────────────────── */

const CAPA = [
  { label: "Change / deviation raised", meta: "DEV-2411-024 · logged with owner and date", icon: FileWarning },
  { label: "Investigation", meta: "Root cause recorded against the affected batches", icon: SearchCheck },
  { label: "CAPA", meta: "Corrective and preventive actions with due dates", icon: ClipboardList },
  { label: "Approval", meta: "QA sign-off before the change takes effect", icon: FileSignature },
  { label: "Audit trail", meta: "Who changed what, when, and why — retained", icon: ScrollText, verified: true },
];

export function ChangeControlVisual() {
  return (
    <DiagramPanel
      label="Deviation · DEV-2411-024"
      right={<StateChip label="Under CAPA" state="quarantine" />}
    >
      <FlowLadder nodes={CAPA} />
    </DiagramPanel>
  );
}

/* ── 08 · Audit readiness ────────────────────────────────────────────────── */

const AUDIT_ITEMS = [
  "Batch records complete and retrievable by batch number",
  "Raw-material lots traceable to every batch they reached",
  "Quality results attached to the stage that produced them",
  "Approvals carry the approver, the role and the timestamp",
  "Equipment calibration and validation history on record",
  "Deviations closed with investigation, CAPA and sign-off",
];

const PULL_UP = [
  { label: "Batch record", meta: "BMR / BPR" },
  { label: "Genealogy", meta: "Forward + backward" },
  { label: "QC results", meta: "Per stage" },
  { label: "Approvals", meta: "With audit trail" },
  { label: "Equipment", meta: "Cal. + validation" },
  { label: "Deviations", meta: "CAPA status" },
];

export function AuditVisual() {
  return (
    <DiagramPanel
      label="Audit Readiness Check"
      right={<StateChip label="6 / 6 in place" state="released" />}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ul className="flex list-none flex-col gap-1.5">
          {AUDIT_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-[10px] border border-line bg-white px-3 py-2"
            >
              <BadgeCheck
                size={14}
                strokeWidth={2.3}
                className="mt-[1px] shrink-0"
                style={{ color: "var(--state-released)" }}
              />
              <span className="text-[12px] leading-snug text-ink">{item}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-[10px] border border-line bg-white p-3">
          <p className="eyebrow" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
            Pull up on request
          </p>
          <ul className="mt-2.5 grid list-none grid-cols-2 gap-1.5">
            {PULL_UP.map((p) => (
              <li
                key={p.label}
                className="rounded-[8px] px-2 py-1.5"
                style={{ background: "var(--state-controlled-bg)" }}
              >
                <span className="block truncate text-[11px] font-bold leading-tight text-navy">
                  {p.label}
                </span>
                <span className="block truncate text-[9.5px] leading-tight text-muted">
                  {p.meta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DiagramPanel>
  );
}
