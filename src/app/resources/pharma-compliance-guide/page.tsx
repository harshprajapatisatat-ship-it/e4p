import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PharmaLandingShell from "@/components/pharma/PharmaLandingShell";

/**
 * Secondary conversion — "Get the Free Guide" / "Get the Compliance Guide".
 * Both labels point here.
 */
export const metadata: Metadata = {
  title: "Free Pharma Compliance & Audit Readiness Guide | Satat Technologies",
  description:
    "A practical guide to building a systematic pharma process: batch traceability, documentation, quality checkpoints, equipment validation, change control and audit readiness.",
  alternates: { canonical: "/resources/pharma-compliance-guide" },
};

const POINTS = [
  "What a batch has to be able to prove, and the records that prove it",
  "Where documentation usually breaks down, and why it is a process problem",
  "Quality checkpoints mapped to each stage from incoming material to release",
  "An audit readiness checklist you can walk your own unit against",
];

export default function ComplianceGuidePage() {
  return (
    <>
      <Header />
      <PharmaLandingShell
        eyebrow="Free Guide"
        title="Build a process that"
        accent="documents itself"
        lede="A practical walkthrough of what a systematic pharma process actually looks like — the records, the checkpoints, the approvals and the trail — written for the people who have to produce it, not for auditors."
        pointsLabel="What's inside"
        points={POINTS}
        variant="guide"
        showScheduleMLink
      />
      <Footer />
    </>
  );
}
