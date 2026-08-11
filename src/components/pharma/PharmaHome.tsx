import PharmaHero from "./PharmaHero";
import PharmaDashboard from "./PharmaDashboard";
import PharmaChallenges from "./PharmaChallenges";
import PharmaScheduleM from "./PharmaScheduleM";

/**
 * Home page body for the ERPNext-for-Pharma site. Header and Footer stay in the
 * route file, matching the Manufacturing site's convention.
 *
 * The page is exactly three sections, in this order and no other:
 *
 *   Hero          headline, subheadline and two CTAs over the video
 *   Dashboard     the ERPNext pharma screen, tilted and levelling on scroll
 *   Challenges    "These are the daily problems." — eight of them, then a CTA
 *   Schedule M    "Regulation makes it critical." — what it expects, the real
 *                 risk, the one-system answer, then the closing CTAs
 */

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Satat Technologies | ERPNext for Pharmaceutical Manufacturing",
  description:
    "ERPNext implementation partner for pharmaceutical manufacturers. Batch traceability, batch documentation, quality control, inventory and expiry management, warehouse control, equipment validation, change control and audit readiness in one system.",
  url: "https://satat.tech/",
  areaServed: "IN",
  serviceType: "Pharmaceutical manufacturing ERP implementation",
  address: {
    "@type": "PostalAddress",
    streetAddress: "501 Aarohi Verve, Bopal-Ambli Cross Road, Sardar Patel Ring Road",
    addressLocality: "Ahmedabad",
    addressRegion: "Gujarat",
    postalCode: "380058",
    addressCountry: "IN",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Pharmaceutical Manufacturing ERP Solutions",
    itemListElement: [
      "Batch Traceability",
      "Batch Documentation",
      "Quality Control",
      "Inventory & Expiry Management",
      "Warehouse Control",
      "Equipment Maintenance & Validation",
      "Change Control & Deviations",
      "Audit Readiness",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

export default function PharmaHome() {
  return (
    <main>
      <PharmaHero />
      <PharmaDashboard />
      <PharmaChallenges />
      <PharmaScheduleM />
    </main>
  );
}
