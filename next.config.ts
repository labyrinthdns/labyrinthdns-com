import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// NEXT_EXPORT=1 (set by the GitHub Pages workflow) produces a static export
// in out/ — no ISR, trailing slashes so GitHub Pages' directory-index
// serving resolves every route. Local dev / `next start` stay standard.
const isStaticExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  ...(isStaticExport
    ? { output: "export" as const, trailingSlash: true }
    : {}),
};

// Turbopack requires serializable loader options, so remark plugins are
// referenced by module name (resolved inside the loader) instead of by
// imported function references.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
