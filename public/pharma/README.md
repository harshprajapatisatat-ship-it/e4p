# Photography manifest — `/public/pharma`

This directory is intentionally empty. The site ships with **no photography**:
every visual on the page is code-native (SVG/CSS ERP panels, traceability flows,
zone maps). Nothing renders a placeholder, so the page is complete as-is.

This file specifies the photo set for when real imagery is available, so it can
be dropped in without redesigning anything.

## Why there are no photos yet

The build was scoped to generate this set via the Higgsfield MCP, but that account
reported `credits: 0`, plan `free`, and no unlimited allowance, so generation could
not run. The alternatives are: top up and re-run generation, or supply real client
photography (strongly preferred for a B2B pharma buyer — authentic plant imagery
outperforms any generated or stock shot).

## Video — the band under the navbar

`PharmaVideoBand.tsx` renders a full-bleed clip directly below the fixed navbar
from these two files, both of which are now in place:

| Filename | What it is |
| --- | --- |
| `pharma-hero.mp4` | 1920×1080, 11.0s, no audio track, 1.2 MB, `+faststart`. Above the fold, so the budget is **≤ 6 MB**. |
| `pharma-hero.jpg` | Poster frame, 1920px wide, 75 KB. Shown before the clip loads, and shown *instead* of it for visitors with reduced-motion enabled. |

If the files are ever missing the band falls back to its navy brand gradient —
the failed `<video>` is pulled out of the layout by its `onError`, so nothing
renders as a black rectangle.

### How the current clip was produced

Source: `4724764_Close_Up_Pharmaceutical_1920x1080.mp4` (Magnific stock, supplied
by the client). **That source file is damaged.** Its container carries all 382
packets across the full 15.9s, but the H.264 length prefixes are malformed from
frame 132 onward, and only the first **5.5s** decodes. Confirmed against a stream
copy, an `-err_detect ignore_err -fflags +discardcorrupt` pass, and an Annex-B
re-extraction — all three recover exactly 132 frames. Re-downloading the asset is
the only way to get the remaining 10 seconds.

Those 5.5 usable seconds are a slow push across a pharmacy counter, so a hard cut
back to frame 1 would visibly jump. The shipped clip is therefore a **palindrome**
— the segment forward, then reversed — which loops seamlessly at 11.0s:

```sh
# 1 · recover the usable frames onto a clean, constant-rate timeline
ffmpeg -i SOURCE.mp4 -map 0:v:0 -an -vf "setpts=N/(24000/1001)/TB" \
  -vsync cfr -r 24000/1001 -c:v libx264 -preset medium -crf 16 clean.mp4

# 2 · forward + reverse, encoded to the delivery budget
ffmpeg -i clean.mp4 -filter_complex \
  "[0:v]split[a][b];[b]reverse,setpts=N/(24000/1001)/TB[r];\
   [a][r]concat=n=2:v=1,setpts=N/(24000/1001)/TB[v]" \
  -map "[v]" -an -r 24000/1001 -c:v libx264 -preset slow -crf 26 \
  -pix_fmt yuv420p -profile:v high -level 4.0 -movflags +faststart \
  pharma-hero.mp4

# 3 · poster frame
ffmpeg -i SOURCE.mp4 -map 0:v:0 -vf "select='eq(n\,65)'" -frames:v 1 -q:v 3 \
  pharma-hero.jpg
```

### Replacing it

Framing: a plant/cleanroom/packaging-line clip that survives being cropped to a
short wide band and having a navy scrim over its top edge. Avoid on-screen text,
hard cuts, or a subject sitting at the very top of frame. Note that the current
clip is a **retail pharmacy counter**, not manufacturing — see the caveat the
build flagged.

## Specifications

All slots are the same shape, matching the Manufacturing site's treatment:

- **Format** — `.jpg`, sRGB, quality ~82
- **Aspect** — 16:9 for bands, 16:7 for the wide feature slot
- **Width** — 1600px (2× the largest rendered width)
- **Framing** — realistic lighting, sophisticated composition, minimal clutter,
  no visible faces close-up, no legible third-party branding
- **Avoid** — pills/capsules piles, hospital settings, doctors, medical crosses,
  cheesy stock posing, oversaturated colour

## The set

| Filename | Subject brief | Suggested placement |
| --- | --- | --- |
| `cleanroom-line.jpg` | Gowned operators in a Grade C/D cleanroom beside a running solid-dosage line; clean surfaces, even cool lighting | Hero support band, or challenge 01 |
| `qc-laboratory.jpg` | Analyst at an HPLC/dissolution bench, sample vials in a rack, lab notebook or terminal in frame | Challenge 03 (quality) |
| `blister-packaging.jpg` | Blister packing / cartoning machine mid-run, foil web and formed pockets visible, no legible brand | Challenge 02 or 03 |
| `granulation-suite.jpg` | Fluid-bed dryer or high-shear granulator in a production suite, stainless and glass, control panel lit | Challenge 06 (equipment) |
| `warehouse-zones.jpg` | Pharma warehouse aisle with clearly labelled racking and zone signage; pallets shrink-wrapped and tagged | Challenge 05 (warehouse) |
| `cold-chain-store.jpg` | Walk-in 2–8 °C store, wire shelving, digital temperature display in frame | Challenge 05, cold-chain callout |
| `equipment-calibration.jpg` | Technician calibrating an instrument with a certificate/tag visible on the equipment | Challenge 06 |
| `batch-documentation.jpg` | Hands over a batch record folder beside a terminal showing the same record; signature/date block visible | Challenge 02 (documentation) |
| `erp-dashboard.jpg` | Supervisor at a shop-floor terminal, a batch or QC screen on display, plant softly out of focus behind | Hero support band, or solution section |
| `audit-walkthrough.jpg` | Two people reviewing records at a desk in a production office, calm and procedural | Challenge 08 (audit readiness) |
| `visual-inspection.jpg` | Operator at a lit inspection station examining ampoules/vials against a light box | Challenge 03 |
| `warehouse-quarantine.jpg` | Quarantine area with restricted-access signage and status labels on stock | Challenge 05 |

## Wiring one in

The diagrams are the primary visual; a photo should sit **beside or above** one,
never replace it. Inside any challenge card, above the `<Visual />`:

```tsx
import Image from "next/image";

<figure className="m-0 mb-4 overflow-hidden rounded-[14px] border border-line bg-surface">
  <div className="relative" style={{ aspectRatio: "16 / 9" }}>
    <Image
      src="/pharma/qc-laboratory.jpg"
      alt="Analyst running a dissolution test at a QC laboratory bench"
      fill
      sizes="(max-width: 1023px) 100vw, 46vw"
      className="object-cover"
    />
  </div>
</figure>
```

Notes:

- `sizes` must reflect the real rendered width — `46vw` for a two-up grid card,
  `56vw` for the wide feature card's visual column, `100vw` below `lg`.
- Add `priority` only to an image above the fold; never to more than one.
- `alt` describes what is happening in the frame. It is not a caption and not a
  keyword list.
- Keep the `rounded-[14px] border border-line` frame so photos sit in the same
  card treatment as the diagrams.
