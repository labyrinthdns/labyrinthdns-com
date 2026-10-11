"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Menu, Star, X } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand";
import { GitHubMark } from "@/components/github-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader({ stars = site.stars }: { stars?: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const sections = navLinks
      .filter((link) => link.href.startsWith("/#"))
      .map((link) => ({
        href: link.href,
        element: document.getElementById(link.href.slice(2)),
      }))
      .filter((section) => section.element);
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const current = sections
        .filter(
          (section) =>
            section.element!.getBoundingClientRect().top <=
            window.innerHeight * 0.36,
        )
        .at(-1);
      setActiveSection(current?.href ?? "");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const currentLink = (href: string) =>
    href === "/docs" && pathname.startsWith("/docs")
      ? ("page" as const)
      : href === activeSection
        ? ("location" as const)
        : undefined;

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 transition-colors duration-200",
        scrolled
          ? "border-b border-border bg-bg/85 backdrop-blur-md"
          : "border-b border-border bg-bg/95",
      )}
    >
      <motion.div
        aria-hidden="true"
        className="reading-progress"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Labyrinth DNS — back to top"
          className="flex items-center"
        >
          <Brand />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {navLinks
            .filter((link) => !["RFCs", "Install"].includes(link.label))
            .map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={currentLink(link.href)}
                className="chapter-link rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                {link.label}
              </a>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-primary/40 hover:text-fg sm:inline-flex"
          >
            <GitHubMark className="size-4" />
            <span className="flex items-center gap-1 font-mono text-xs tabular-nums">
              <Star className="size-3 fill-primary text-primary" />
              {stars}
            </span>
          </a>
          <ThemeToggle />
          <Link
            href="/#install"
            className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Get started
          </Link>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:text-fg xl:hidden"
              >
                <Menu className="size-5" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="menu-overlay fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
              <Dialog.Content className="menu-panel fixed inset-y-0 right-0 z-50 flex w-80 max-w-[88vw] flex-col border-l border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-lg font-semibold">
                    Menu
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-fg"
                    >
                      <X className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Site navigation
                </Dialog.Description>

                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base text-muted transition-colors hover:bg-raised hover:text-fg"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                  >
                    <GitHubMark className="size-4" />
                    GitHub
                  </a>
                  <ThemeToggle />
                </div>
                <Link
                  href="/#install"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-bg transition-opacity hover:opacity-90"
                >
                  Get started
                </Link>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
