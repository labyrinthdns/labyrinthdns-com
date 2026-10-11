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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:gap-12">
        <aside
          aria-label="Documentation sidebar"
          className="hidden w-56 shrink-0 lg:block"
        >
          <div className="sticky top-24 py-12">
            <DocsSidebarNav />
          </div>
        </aside>
        <div className="min-w-0 flex-1 py-10 lg:py-14">
          <div className="mb-8 lg:hidden">
            <DocsMobileNav />
          </div>
          <main className="max-w-prose pb-10">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
