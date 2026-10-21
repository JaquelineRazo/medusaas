import type { NextConfig } from "next";

// Phase 1 prototype is a static export served by GitHub Pages
// (medusaas.razzobusiness.com). Phase 2–3 need a server: see BRIEF.md §3.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
