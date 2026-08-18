/**
 * Destinations and CTA wordings for the whole site.
 *
 * This module has NO `"use client"` directive, on purpose. These constants are
 * read by both Server Components (route files, not-found) and Client Components
 * (every section). A value exported from a `"use client"` module and imported
 * into a Server Component is replaced by a client-reference stub — it arrives as
 * `undefined` on the server, which surfaces as a `formatUrl` crash the moment
 * such a value reaches a `<Link href>`. Keeping them in a neutral module is what
 * makes them safe on both sides of the boundary.
 */

/**
 * The guide page. Three CTAs land here — "Get the Free Guide", "Get the
 * Compliance Guide" and "View Schedule M Guidelines" — so the path is named
 * once and shared rather than repeated.
 */
const GUIDE = "/pharma-compliance-guide";

/**
 * Official CDSCO Schedule M source, supplied by the client. Do not rewrite,
 * shorten or re-encode this URL.
 *
 * The direct CDSCO link. The value this replaced had been through a Google
 * redirect, which left the query string mangled — `num_id%3DMTA4MTU%3D` rather
 * than `num_id=MTA4MTU=`, so the parameter name was never actually parsed as
 * one — along with four `sa`/`source`/`ust`/`usg` redirect parameters CDSCO has
 * no use for. Both the "View Schedule M Guidelines" button and the guide page's
 * source reference read this constant, so they cannot drift apart.
 */
export const CDSCO_SCHEDULE_M =
  "https://cdsco.gov.in/opencms/opencms/system/modules/CDSCO.WEB/elements/download_file_division.jsp?num_id=MTA4MTU=";

/**
 * The gated asset. The guide form is the gate: fill it in and this is what you
 * get on the other side.
 *
 * NOTE: this file is not in the repo yet — drop the PDF at
 * `public/pharma/erpnext-pharma-manufacturing-guide.pdf` and the download works
 * with no further changes. Until then the button 404s, which is why the form
 * only ever promises the download once it can actually hand one over.
 */
export const GUIDE_PDF = "/pharma/erpnext-pharma-manufacturing-guide.pdf";

/** The site has exactly three conversion targets. Every CTA points at one. */
export const ROUTES = {
  /**
   * Primary conversion — every "Book a Free Demo" lands on the webinar
   * registration page. `/contact` still exists and is still reachable from the
   * header nav; it is simply no longer the demo CTA's destination.
   */
  demo: "/erpnext-pharma-webinar",
  /** Secondary conversion — Get the Free Guide / Get the Compliance Guide. */
  guide: GUIDE,
  /** "View Schedule M Guidelines" — the official CDSCO document, in a new tab. */
  scheduleM: CDSCO_SCHEDULE_M,
  /** The guide page's lead form, for the in-page download CTAs. */
  guideForm: GUIDE + "#guide-form",
  /** Contact us. */
  contact: "/contact",
  /** On-page anchors. The home page has exactly these two sections below the hero. */
  challenges: "#challenges",
  compliance: "#schedule-m",
} as const;

/**
 * Real Satat Technologies contact details, taken from the company's own
 * Manufacturing site and this site's footer. Do not invent or "tidy" these —
 * a wrong number or address on a contact page is worse than none at all.
 *
 * Note: the Manufacturing site's phone link is currently a broken placeholder
 * (`tel:+91XXXXXXXXXX`) even though it displays the real number. `tel` here is
 * built from the real digits so the link actually dials.
 */
export const CONTACT = {
  phone: "+91 87990 27217",
  tel: "tel:+918799027217",
  phoneNote: "Free Consultation",
  email: "sales@satat.tech",
  mailto: "mailto:sales@satat.tech",
  emailNote: "Help & email support",
  address:
    "501 Aarohi Verve, Bopal-Ambli Cross Road, Sardar Patel Ring Rd, Ahmedabad, Gujarat – 380058 India",
} as const;

/**
 * The only CTA wordings used anywhere on this site. Centralised so the label
 * hierarchy cannot drift section to section.
 */
export const CTA_LABELS = {
  demo: "Book a Free Demo",
  /** The header bar's CTA. Points at the webinar, so it says so. */
  joinWebinar: "Join Webinar",
  /** The hero's secondary action — goes to Contact us, not to a booking. */
  getInTouch: "Get in touch",
  guide: "Get the Free Guide",
  complianceGuide: "Get the Compliance Guide",
  auditReady: "Let's Make Your Pharma Unit Audit-Ready",
  seeSolution: "See How ERPNext Solves This",
  scheduleM: "View Schedule M Guidelines",
} as const;
