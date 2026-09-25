import type { NextConfig } from "next";

// Static export: the panel is plain client-side pages talking to the API, so it
// deploys to any static host (Cloudflare Pages). Set NEXT_PUBLIC_API_URL at build time.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
