"use client";

import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Building blocks for the process diagrams on this page.
 *
 * Every "one step leads to the next" story in pharma — batch genealogy, QC
 * gates, calibration cycles, CAPA trails, approval chains — is drawn with the
 * SAME two pieces: a node and a dashed connector (`.flow-seg`, see globals.css).
 * That is deliberate: a visitor learns the visual grammar once in the
 * traceability diagram and then reads all seven of the others instantly.
 *
 * The connector is vertical while the flow is stacked and horizontal from 640px
 * up, so a desktop left-to-right diagram becomes a mobile top-to-bottom one with
 * no separate markup.
 */

export type FlowNode = {
  label: string;
  /** Optional second line — a state, a value, a code. */
  meta?: string;
  icon?: LucideIcon;
  /** Terminal/confirmed step gets the teal "verified" treatment. */
  verified?: boolean;
};

/**
 * Chain of nodes: stacked vertically below 640px, side-by-side from there up.
 * The 640px switch must stay in sync with `.flow-seg` in globals.css.
 *
 * `dense` drops the icon chips and tightens the padding, for the compact
 * diagrams that sit inside a half-width challenge card.
 */
export function FlowChain({
  nodes,
  dense = false,
  className = "",
}: {
  nodes: FlowNode[];
  dense?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={`flex list-none flex-col items-stretch sm:flex-row ${className}`}
    >
      {nodes.map((node, i) => {
        const Icon = node.icon;
        const verified = node.verified;
        return (
          <Fragment key={node.label}>
            {i > 0 && (
              <li aria-hidden className="flex shrink-0 sm:flex-1">
                <span
                  className="flow-seg"
                  style={
                    verified
                      ? ({ "--rail-color": "rgba(20,168,155,0.55)" } as React.CSSProperties)
                      : undefined
                  }
                />
              </li>
            )}
            <li
              className={`flex min-w-0 shrink-0 flex-col items-center gap-1.5 rounded-[12px] border bg-white text-center ${
                dense ? "px-2.5 py-2.5" : "px-3 py-3"
              }`}
              style={{
                borderColor: verified ? "rgba(20,168,155,0.35)" : "var(--color-line)",
                background: verified ? "var(--state-released-bg)" : "#fff",
                flexBasis: 0,
                flexGrow: 1,
              }}
            >
              {Icon && !dense && (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-[9px]"
                  style={{
                    background: verified
                      ? "rgba(20,168,155,0.14)"
                      : "var(--state-controlled-bg)",
                  }}
                >
                  <Icon
                    size={14}
                    strokeWidth={2.2}
                    style={{
                      color: verified ? "var(--state-released)" : "var(--color-navy)",
                    }}
                  />
                </span>
              )}
              <span
                className={`block leading-tight ${dense ? "text-[10.5px]" : "text-[11.5px]"} font-bold`}
                style={{ color: verified ? "var(--state-released)" : "var(--color-ink)" }}
              >
                {node.label}
              </span>
              {node.meta && (
                <span className="data-mono block text-[9.5px] leading-tight text-muted">
                  {node.meta}
                </span>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/**
 * Always-vertical variant — for chains that read as a sequence of events in
 * time (change control, audit trail) rather than a material flow, and which
 * therefore stay stacked at every breakpoint.
 */
export function FlowLadder({
  nodes,
  className = "",
}: {
  nodes: FlowNode[];
  className?: string;
}) {
  return (
    <ol className={`flex list-none flex-col ${className}`}>
      {nodes.map((node, i) => {
        const Icon = node.icon;
        const last = i === nodes.length - 1;
        return (
          <li key={node.label} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            {/* Rail column — marker with the dashed line continuing beneath it */}
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  last ? "verify-pulse" : ""
                }`}
                style={{
                  borderColor: last ? "rgba(20,168,155,0.45)" : "rgba(0,68,124,0.22)",
                  background: last ? "var(--state-released-bg)" : "var(--state-controlled-bg)",
                }}
              >
                {Icon ? (
                  <Icon
                    size={13}
                    strokeWidth={2.3}
                    style={{ color: last ? "var(--state-released)" : "var(--color-navy)" }}
                  />
                ) : (
                  <span className="data-mono text-[10px] font-bold text-navy">{i + 1}</span>
                )}
              </span>
              {!last && (
                <span
                  aria-hidden
                  className="flow-rail-v my-1 w-[2px] flex-1"
                  style={{ minHeight: 14 }}
                />
              )}
            </div>

            {/* Content column */}
            <div className={last ? "pb-0" : "pb-4"}>
              <p
                className="text-[12.5px] font-bold leading-tight"
                style={{ color: last ? "var(--state-released)" : "var(--color-ink)" }}
              >
                {node.label}
              </p>
              {node.meta && (
                <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{node.meta}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Frame every diagram sits in — a labelled panel that reads as a slice of the
 * ERP rather than decoration. `label` is the screen/record name, `right` an
 * optional status chip.
 */
export function DiagramPanel({
  label,
  right,
  children,
  className = "",
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`m-0 overflow-hidden rounded-[14px] border border-line bg-surface ${className}`}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-white px-3.5 py-2.5">
        <span className="eyebrow truncate" style={{ fontSize: "0.62rem", letterSpacing: "0.16em" }}>
          {label}
        </span>
        {right}
      </figcaption>
      <div className="p-3.5">{children}</div>
    </figure>
  );
}

/** Thin labelled progress meter — shelf life, calibration validity, readiness. */
export function Meter({
  value,
  tone = "released",
  className = "",
}: {
  /** 0–100. */
  value: number;
  tone?: "released" | "quarantine" | "rejected" | "controlled";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span
      className={`block h-1.5 w-full overflow-hidden rounded-pill ${className}`}
      style={{ background: "rgba(11,31,51,0.08)" }}
      role="img"
      aria-label={`${pct}%`}
    >
      <span
        className="block h-full rounded-pill"
        style={{ width: `${pct}%`, background: `var(--state-${tone})` }}
      />
    </span>
  );
}
