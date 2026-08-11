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

/** The site has exactly three conversion targets. Every CTA points at one. */
export const ROUTES = {
  /** Primary conversion — Book a Free Demo. */
  demo: "/contact#demo",
  /** Secondary conversion — Get the Free Guide / Get the Compliance Guide. */
  guide: "/resources/pharma-compliance-guide",
  /**
   * Official CDSCO Schedule M source, supplied by the client. Opens in a new
   * tab. Do not rewrite, shorten or re-encode this URL.
   */
  scheduleM:
    "https://cdsco.gov.in/opencms/opencms/system/modules/CDSCO.WEB/elements/download_file_division.jsp?num_id%3DMTA4MTU%3D&sa=D&source=docs&ust=1786344790876111&usg=AOvVaw2QQ20AXGoEQ5dQ8XfrQvHJ",
  /** On-page anchors. The home page has exactly these two sections below the hero. */
  challenges: "#challenges",
  compliance: "#schedule-m",
} as const;

/**
 * The only CTA wordings used anywhere on this site. Centralised so the label
 * hierarchy cannot drift section to section.
 */
export const CTA_LABELS = {
  demo: "Book a Free Demo",
  guide: "Get the Free Guide",
  complianceGuide: "Get the Compliance Guide",
  auditReady: "Let's Make Your Pharma Unit Audit-Ready",
  seeSolution: "See How ERPNext Solves This",
  scheduleM: "View Schedule M Guidelines",
} as const;
