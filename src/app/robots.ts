import type { MetadataRoute } from "next";

// Static-export compatible (GitHub Pages build requires explicit static).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://labyrinthdns.com/sitemap.xml",
  };
}
