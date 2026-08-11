import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Needed to render the local Google Drive brand SVG via next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
