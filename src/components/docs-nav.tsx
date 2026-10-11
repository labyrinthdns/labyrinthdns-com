"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(href: string, pathname: string): boolean {
  if (href === "/docs") {
    return pathname === "/docs" || pathname === "/docs/";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function DocsSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-1">
      {docsNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href, pathname) ? "page" : undefined}
          className={cn(
            "rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
            isActive(item.href, pathname)
              ? "border-primary bg-raised font-medium text-fg"
              : "border-transparent text-muted hover:bg-raised/50 hover:text-fg",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DocsMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Documentation"
      className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1.5"
    >
      {docsNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href, pathname) ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors",
            isActive(item.href, pathname)
              ? "bg-raised font-medium text-fg"
              : "text-muted hover:text-fg",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
