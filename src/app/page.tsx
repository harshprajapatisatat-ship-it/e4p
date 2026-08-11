import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PharmaHome, { homeJsonLd } from "@/components/pharma/PharmaHome";

/**
 * Home page of the ERPNext-for-Pharma site.
 *
 * Primary conversion is Book a Free Demo (/contact#demo); the secondary is the
 * free guide. Both are reachable from the header, the hero, the closing CTA and
 * the footer.
 */
export const metadata: Metadata = {
  title:
    "ERPNext for Pharmaceutical Manufacturing | Batch Traceability & Audit Readiness | Satat Technologies",
  description:
    "Pharma is more than manufacturing medicines. ERPNext brings batch traceability, documentation, quality control, expiry management, equipment validation and change control into one system — so your unit stays audit-ready.",
  keywords: [
    "ERPNext for pharma",
    "pharmaceutical ERP",
    "pharma manufacturing software",
    "batch traceability software",
    "Schedule M compliance software",
    "batch manufacturing record ERP",
    "pharma quality management ERP",
    "audit readiness pharma",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "ERPNext for Pharmaceutical Manufacturing | Satat Technologies",
    description:
      "Compliance, quality, traceability and documentation in one system. ERPNext helps pharma manufacturers simplify complexity while staying audit-ready.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Header />
      <PharmaHome />
      <Footer />
    </>
  );
}
