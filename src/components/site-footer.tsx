import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { Brand } from "@/components/brand";

const projectLinks = [
  { href: site.github, label: "GitHub" },
  { href: site.releases, label: "Releases" },
  { href: site.issues, label: "Issues" },
  { href: site.security, label: "Security policy" },
  { href: site.conduct, label: "Code of conduct" },
];

export function SiteFooter({
  version = site.version,
}: {
  version?: string;
}) {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Labyrinth DNS — back to top">
              <Brand />
            </Link>
            <p className="mt-4 max-w-sm font-display text-base italic text-muted">
              {site.motto}
            </p>
            <p className="mt-4 font-mono text-xs text-muted">
              MIT · Zero dependencies · Single binary
            </p>
          </div>

          <nav aria-label="Product">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Project">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Project
            </h3>
            <ul className="mt-4 space-y-2.5">
              {projectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 font-mono text-xs text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Labyrinth DNS</span>
          <span className="tabular-nums">{version}</span>
          <span className="tracking-wider">
            Serial: your-resolver-01 · Follow the thread.
          </span>
        </div>
      </div>
    </footer>
  );
}
