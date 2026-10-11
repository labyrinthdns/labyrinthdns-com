import type { MetadataRoute } from "next";

// Static-export compatible (GitHub Pages build requires explicit static).
export const dynamic = "force-static";

// GitHub Pages' directory-index serving needs trailing slashes in the
// exported build; standard deployments use clean URLs.
const isStaticExport = process.env.NEXT_EXPORT === "1";
const url = (path: string) =>
  `https://labyrinthdns.com${path}${isStaticExport ? "/" : ""}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: url(""), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/docs"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    {
      url: url("/docs/installation"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: url("/docs/quick-start"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: url("/docs/configuration"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: url("/docs/dashboard"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: url("/docs/api"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: url("/docs/monitoring"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: url("/docs/resolution"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/wire-protocol"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/caching"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/security"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/daemon-mode"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/benchmark"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/performance-tuning"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: url("/docs/troubleshooting"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
