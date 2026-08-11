import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PharmaLandingShell from "@/components/pharma/PharmaLandingShell";

/**
 * The site's primary conversion destination. The home page's every "Book a Free
 * Demo" points at `/contact#demo`, which lands here with the form in view.
 */
export const metadata: Metadata = {
  title: "Book a Free ERPNext Demo for Pharma | Satat Technologies",
  description:
    "Book a free ERPNext demo built around your pharma unit — batch traceability, documentation, quality control and audit readiness walked through on a live system.",
  alternates: { canonical: "/contact" },
};

const POINTS = [
  "A live ERPNext instance, not slides — your scenario, run end to end",
  "Batch genealogy traced forward from a material lot and backward from a pack",
  "How batch records, QC results and approvals are captured as the process runs",
  "Open Q&A: bring the part of your process that is hardest to prove today",
];

export default function ContactPage() {
  return (
    <>
      <Header />
      {/* The anchor every demo CTA targets. Offset by the fixed header's height
          via scroll-margin so the form is not hidden under the bar on jump. */}
      <div id="demo" className="scroll-mt-[88px]" />
      <PharmaLandingShell
        eyebrow="Book a Free Demo"
        title="See it run on"
        accent="your process"
        lede="Tell us about your unit and we'll build the session around it — the batches you make, the records you have to produce, and the audits you have to be ready for."
        pointsLabel="What the session covers"
        points={POINTS}
        variant="demo"
      />
      <Footer />
    </>
  );
}
