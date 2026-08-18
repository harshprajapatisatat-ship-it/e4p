import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The guide moved up out of /resources — there was only ever one page under
   * it, so the segment carried no meaning and made the URL longer than the
   * thing it named.
   *
   * The old path is kept alive as a permanent redirect rather than deleted:
   * it has been linked from the header, the footer and three in-page CTAs, and
   * anything already shared or indexed must not start 404ing.
   */
  async redirects() {
    return [
      {
        source: "/resources/pharma-compliance-guide",
        destination: "/pharma-compliance-guide",
        permanent: true,
      },
      // Nothing else ever lived under /resources.
      { source: "/resources", destination: "/pharma-compliance-guide", permanent: true },
    ];
  },

  images: {
    // Needed to render the local Google Drive brand SVG via next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
