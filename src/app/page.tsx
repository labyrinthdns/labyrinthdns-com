import { getRepoStats } from "@/lib/github";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatsStrip } from "@/components/stats-strip";
import { Features } from "@/components/features";
import { DashboardMock } from "@/components/dashboard-mock";
import { ResolutionFlow } from "@/components/resolution-flow";
import { NothingDnsPromo } from "@/components/nothingdns-promo";
import { Performance } from "@/components/performance";
import { RfcMatrix } from "@/components/rfc-matrix";
import { Comparison } from "@/components/comparison";
import { InstallSection } from "@/components/install-section";
import { PromoPlate } from "@/components/promo-plate";
import { SiteFooter } from "@/components/site-footer";
import { QuickAnswers } from "@/components/quick-answers";

// GitHub stars + latest release refresh every 6 hours via the fetch-level
// revalidate in src/lib/github.ts — that drives this route's ISR (shown as
// "Revalidate: 6h" in the build output). A static export (GitHub Pages)
// simply bakes the values in at build time instead.

export default async function Home() {
  const stats = await getRepoStats();

  return (
    <>
      <SiteHeader stars={stats.stars} />
      <main id="main-content" tabIndex={-1}>
        <Hero version={stats.version} />
        <StatsStrip />
        <Features />
        <DashboardMock />
        <ResolutionFlow />
        <NothingDnsPromo />
        <Performance />
        <RfcMatrix />
        <Comparison />
        <QuickAnswers />
        <InstallSection version={stats.version} />
        <PromoPlate version={stats.version} />
      </main>
      <SiteFooter version={stats.version} />
    </>
  );
}
