import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import PharmaLandingShell from "@/components/pharma/PharmaLandingShell";
import PharmaGuideDetail from "@/components/pharma/PharmaGuideDetail";
import { GUIDE_PDF } from "@/lib/routes";

/**
 * The guide page. Three CTAs land here: "Get the Free Guide", "Get the
 * Compliance Guide" and "View Schedule M Guidelines".
 *
 * The hero carries the pitch and the lead form; `PharmaGuideDetail` carries the
 * long-form copy below it.
 */
export const metadata: Metadata = {
  title:
    "ERPNext for Pharma Manufacturing — Free Guide | Satat Technologies",
  description:
    "See what a controlled pharmaceutical manufacturing operation looks like on ERPNext: batch and material management, traceability, production planning, manufacturing, cost and margins, and quality checks in one flow.",
  alternates: { canonical: "/resources/pharma-compliance-guide" },
  openGraph: {
    title: "ERPNext for Pharma Manufacturing — Free Guide",
    description:
      "A walkthrough of a pharmaceutical manufacturing operation running on ERPNext — from materials entering the plant to a finished batch reaching the customer.",
    type: "article",
  },
};

export default function ComplianceGuidePage() {
  // Checked here, on the server, at build time rather than assumed: the PDF is
  // not in the repo yet, and a download button that 404s is worse than one that
  // is honest about not being ready. Drop the file in and the form starts
  // handing it over with no code change.
  const guideReady = existsSync(path.join(process.cwd(), "public", GUIDE_PDF));

  return (
    <>
      <SiteHeader />
      <PharmaLandingShell
        eyebrow="Free Guide"
        title="See what a controlled"
        accent="manufacturing operation can look like"
        lede="Pharma manufacturing is not just about making products. It is about knowing which batch was made, what went into it, where it went, what it cost, whether it passed quality checks, and whether every step can be traced back when it matters. This guide takes you inside a pharmaceutical manufacturing operation running on ERPNext and shows how these pieces can work together in one system."
        variant="guide"
        downloadHref={guideReady ? GUIDE_PDF : undefined}
      >
        <PharmaGuideDetail />
      </PharmaLandingShell>
      <Footer />
    </>
  );
}
