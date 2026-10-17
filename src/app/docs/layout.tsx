import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DocsMobileNav, DocsSidebarNav } from "@/components/docs-nav";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s · Docs · Labyrinth DNS",
  },
  description:
    "Installation, quick start and configuration guides for Labyrinth DNS — the pure Go recursive resolver.",
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <div className="site-container docs-layout">
        <aside
          aria-label="Documentation sidebar"
          className="hidden w-56 shrink-0 lg:block"
        >
          <div className="sticky top-24 py-12">
            <DocsSidebarNav />
          </div>
        </aside>
        <div className="docs-body min-w-0 py-10 lg:py-14">
          <div className="mb-8 lg:hidden">
            <DocsMobileNav />
          </div>
          <main id="main-content" tabIndex={-1} className="docs-content pb-10">
            {children}
          </main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
