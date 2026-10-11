import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Activity, BookOpenText, Braces, LayoutDashboard, Rocket, Settings2 } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
};

const cards = [
  {
    href: "/docs/installation",
    icon: Rocket,
    title: "Installation",
    blurb:
      "One-line install script, Docker image, or building from source — plus how to verify the install.",
  },
  {
    href: "/docs/quick-start",
    icon: BookOpenText,
    title: "Quick start",
    blurb:
      "From zero to a DNSSEC-validated answer in about two minutes: install, start, dig, dashboard.",
  },
  {
    href: "/docs/configuration",
    icon: Settings2,
    title: "Configuration",
    blurb:
      "labyrinth.yaml end to end — server, resolver, cache, security, web, blocklist — plus CLI flags, environment variables and signals.",
  },
  {
    href: "/docs/dashboard",
    icon: LayoutDashboard,
    title: "Web dashboard",
    blurb:
      "The built-in dashboard end to end — setup wizard, every page, and JWT authentication.",
  },
  {
    href: "/docs/api",
    icon: Braces,
    title: "REST API",
    blurb:
      "The full API surface: stats, cache, blocklist, system, setup and the DoH endpoint.",
  },
  {
    href: "/docs/monitoring",
    icon: Activity,
    title: "Monitoring",
    blurb:
      "Prometheus metrics, the two Zabbix integration modes, health checks and logs.",
  },
];

const reference = [
  {
    href: "/docs/resolution",
    title: "Resolution",
    blurb: "The iterative walk, QNAME minimisation, DNSSEC at every step.",
  },
  {
    href: "/docs/wire-protocol",
    title: "Wire protocol",
    blurb: "Message structure, EDNS0, cookies, 0x20, encrypted transports.",
  },
  {
    href: "/docs/caching",
    title: "Caching",
    blurb: "256 shards, TTL policy, serve-stale, aggressive synthesis.",
  },
  {
    href: "/docs/security",
    title: "Security",
    blurb: "Poisoning defenses, abuse controls, CPU-exhaustion closures.",
  },
  {
    href: "/docs/daemon-mode",
    title: "Daemon mode",
    blurb: "Foreground, daemon, systemd and the signal set.",
  },
  {
    href: "/docs/benchmark",
    title: "Benchmark",
    blurb: "The numbers and how to reproduce them on your hardware.",
  },
  {
    href: "/docs/performance-tuning",
    title: "Performance tuning",
    blurb: "Measure first, then the knobs that matter.",
  },
  {
    href: "/docs/troubleshooting",
    title: "Troubleshooting",
    blurb: "From symptom to log line, checklist style.",
  },
];

export default function DocsIndexPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
        Documentation
      </p>
      <h1 className="mt-3 font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
        Thread your way through.
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        Guides for installing, starting and configuring Labyrinth DNS.
        Everything here mirrors the project README — if the two ever disagree,
        the README wins.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-raised text-primary">
              <card.icon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {card.blurb}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Read
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold">Reference</h2>
      <p className="mt-2 text-sm text-muted">
        Deeper dives, ported from the original documentation tree.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {reference.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="group flex items-baseline justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span>
                <span className="text-sm font-medium text-fg">
                  {page.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {page.blurb}
                </span>
              </span>
              <ArrowRight className="size-3.5 shrink-0 self-center text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted">
        Everything here mirrors the{" "}
        <a
          href={site.readme}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          project README
        </a>{" "}
        — if the two ever disagree, the README wins. The dashboard&rsquo;s
        About page renders the RFC compliance matrix.
      </p>
    </div>
  );
}
