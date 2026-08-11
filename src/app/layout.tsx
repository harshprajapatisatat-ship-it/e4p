import type { Metadata } from "next";
import { Onest } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

/**
 * Onest — the same typeface, weight set and CSS-variable wiring as the
 * Manufacturing site, so type renders identically across both surfaces.
 */
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ERPNext for Pharmaceutical Manufacturing | Satat Technologies",
  description:
    "ERPNext for pharma manufacturers: batch traceability, batch documentation, quality control, expiry management, equipment validation, change control and audit readiness in one system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${onest.variable} h-full overflow-x-hidden antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-x-hidden bg-white font-sans text-ink antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
