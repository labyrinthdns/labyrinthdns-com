import { cache } from "react";
import { site } from "@/lib/site";

/* Live GitHub metadata for the header badge, hero chip, install samples,
   spec plate and footer. Cached per render pass via React cache(); the
   underlying fetches are ISR-cached for 6 hours. Every failure path falls
   back to the static values in lib/site.ts so a build or render never
   breaks on the GitHub API. */

const REVALIDATE_SECONDS = 6 * 60 * 60;
const GITHUB_API = "https://api.github.com/repos/labyrinthdns/labyrinth";

export type RepoStats = {
  stars: number;
  version: string;
};

export const getRepoStats = cache(async (): Promise<RepoStats> => {
  const [stars, version] = await Promise.all([fetchStars(), fetchVersion()]);
  return { stars, version };
});

async function fetchStars(): Promise<number> {
  try {
    const res = await fetch(GITHUB_API, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return site.stars;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : site.stars;
  } catch {
    return site.stars;
  }
}

async function fetchVersion(): Promise<string> {
  try {
    const res = await fetch(`${GITHUB_API}/releases/latest`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return site.version;
    const data = (await res.json()) as { tag_name?: unknown };
    return typeof data.tag_name === "string" && data.tag_name
      ? data.tag_name
      : site.version;
  } catch {
    return site.version;
  }
}
