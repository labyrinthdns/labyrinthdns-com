import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LostSignal } from "@/components/lost-signal";
import { getRepoStats } from "@/lib/github";

export default async function NotFound() {
  const stats = await getRepoStats();
  return (
    <>
      <SiteHeader stars={stats.stars} />
      <main id="main-content" tabIndex={-1} className="site-container not-found">
        <div className="not-found-meta">
          <span>HTTP / 404</span>
          <span>ROUTE UNRESOLVED</span>
        </div>
        <div className="lost-layout">
          <div>
            <p className="eyebrow">Even a good resolver finds a dead end.</p>
            <h1>
              Lost in the
              <br />
              <em>labyrinth.</em>
            </h1>
            <p className="lost-description">
              This path doesn’t lead to a page. The thread back home is still
              here.
            </p>
            <div className="hero-actions">
              <Link href="/" className="editorial-button">
                Follow it home <ArrowUpRight size={18} />
              </Link>
              <Link href="/docs" className="text-link">
                Find your way in the docs <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className="lost-code">
              NXDOMAIN <span>/ No page at this address.</span>
            </p>
          </div>
          <LostSignal />
        </div>
        <div className="not-found-bottom">
          <span>Not every path has an answer.</span>
          <Link href="/">This one does. →</Link>
        </div>
      </main>
    </>
  );
}
