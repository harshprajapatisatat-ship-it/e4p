# ERPNext for Pharmaceutical Manufacturing — Satat Technologies

Pharma-industry edition of the Satat Manufacturing site. Same brand, same design
system, pharma-specific content and diagrams.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

No test suite is configured.

## Stack

Identical to the Manufacturing site (`D:\E2M\Satat-portfolio`) so the two can
share code and stay visually locked together.

- **Next.js 16** / **React 19** — read `node_modules/next/dist/docs/` before
  writing Next.js code; APIs differ from older versions
- **Tailwind CSS v4** — configured entirely via `@theme {}` in `globals.css`;
  there is no `tailwind.config.*`
- **GSAP 3** with `ScrollTrigger` — imported only through `src/lib/gsap.ts`
- **Lenis** for site-wide smooth scroll (`SmoothScroll.tsx`)
- **Lucide React** for icons — note this is **v1**, which no longer ships brand
  glyphs (`Linkedin`, `Youtube`, …). Use inline SVG for those.

## Relationship to the Manufacturing site

The Manufacturing site is the visual source of truth. Carried over unchanged:

| Piece | Where |
| --- | --- |
| Brand palette + Onest type + `.display-lg` / `.eyebrow` | `src/app/globals.css` `@theme` block |
| Container (`max-w-[1320px] px-5 lg:px-8`) and section rhythm (`clamp(4rem,8vw,7rem)`) | `PharmaUI.SectionShell` |
| Eyebrow + 800-weight h2 with orange accent | `PharmaUI.SectionHeading` |
| Orange primary / bordered secondary button, `rounded-[10px]` | `PharmaUI.PrimaryButton` / `SecondaryButton` |
| Fixed 72px header, centred nav, GSAP-morphed mega-menu, full-screen mobile menu | `src/components/Header.tsx` |
| Footer on `bg-orange/2`, 1180px container, 5-column grid | `src/components/Footer.tsx` |
| `useReveal` scroll reveals, `gsap.context` entrance timelines | `src/lib/useReveal.ts` |
| Navy gradient emphasis panel | Schedule M section + final CTA |

Pharma-specific additions, all built **on top of** existing tokens rather than
beside them:

- **Compliance state semantics** (`:root` in `globals.css`) — `released`,
  `quarantine`, `rejected`, `controlled`. Each maps onto a brand token; only
  `rejected` introduces a colour (a desaturated red), because the brand palette
  cannot express it and pharma must be able to show it.
- **Process rails** (`.flow-seg`, `.flow-rail-v`, `.converge-line`) — the shared
  dashed-connector grammar every diagram uses.
- **`.data-mono`** — tabular mono for batch numbers, lot codes and dates, which
  get read character by character against a physical label.

## Page structure

`src/app/page.tsx` → `Header` → `PharmaHome` → `Footer`.

`PharmaHome` is four sections that form one narrative:

1. `PharmaHero` — pharma is more than making medicine
2. `PharmaChallenges` — eight daily problems, each with its own record diagram
3. `PharmaScheduleM` — what the regulation expects, and the real risk
4. `PharmaSolution` — one system, the convergence diagram, then the CTA

### Challenge section rhythm

`01` full width → `02`–`07` two-up → `08` full width. Deliberate: the two most
important challenges (traceability, audit readiness) get room for their diagrams,
and six in a two-column grid fills three clean rows with no orphan card.

### Diagrams

`src/components/pharma/visuals/` — `FlowPrimitives.tsx` holds the shared
`FlowChain` / `FlowLadder` / `DiagramPanel` / `Meter`; `ChallengeVisuals.tsx` has
one diagram per challenge; `ConvergenceDiagram.tsx` is the inputs → ERPNext →
audit-ready funnel.

**Breakpoint note:** `FlowChain`'s `<ol>` flips to `flex-row` at `sm` (640px) and
`.flow-seg` in `globals.css` flips its rail axis at the same 640px. **These two
must stay in sync.** 640px, not the `lg` layout breakpoint: the cards holding
these diagrams are full-width below `lg`, so a six-node chain has more room at
834px than inside a two-up grid card at 1280px.

The identifiers, dates and counts in the diagrams are illustrative sample data,
not customer figures or capability claims.

## Routes

Built here:

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/contact` (`#demo`) | **Primary conversion** — Book a Free Demo |
| `/resources/pharma-compliance-guide` | **Secondary conversion** — free guide |
| `not-found` | On-brand 404 |

Linked at canonical paths but **not built here** — these are the client's existing
routes, and they currently land on the styled 404: `/solutions`, `/industries`,
`/resources`, `/blogs`, `/company`, `/privacy-policy`, `/terms`.

### Conversion wiring

`src/lib/routes.ts` is the single source for every destination and every CTA
label. Change a label there and it changes everywhere.

**That file must not carry `"use client"`.** A value exported from a client module
and imported into a Server Component becomes a client-reference stub — it arrives
`undefined` on the server, and the first `<Link href={undefined}>` crashes the
build inside Next's `formatUrl`. That is exactly why these constants do not live
in `PharmaUI.tsx`.

`PharmaLeadForm` has **no backend**. It validates, shows the pending state, then
confirms — and says plainly that nothing was transmitted. Pass an `action` to
POST to the real endpoint (Frappe/ERPNext Lead, CRM, whatever):

```tsx
<PharmaLeadForm variant="demo" action="/api/lead" />
```

## Content rules

Enforced throughout, and worth preserving on edit:

- ERPNext is positioned as a system that **supports** systematic processes,
  documentation, traceability and audit readiness.
- **No** claim of regulatory certification, Schedule M compliance, FDA/WHO
  approval or GMP certification. The footer and the final CTA both carry an
  explicit disclaimer.
- The hero uses capability statements and four theme pillars rather than
  invented statistics.
- The Schedule M link points at the official CDSCO URL in `src/lib/routes.ts`,
  verbatim, `target="_blank"`. Do not rewrite, shorten or re-encode it.

## Images

The site currently ships **no photography** — every visual is code-native SVG/CSS.
See `public/pharma/README.md` for the manifest of photo slots, exact
specifications, and how to wire them in.
