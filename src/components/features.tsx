import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Binary,
  Gauge,
  LayoutDashboard,
  Lock,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { MazeGlyph } from "@/components/maze-glyph";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: string;
  chips?: string[];
};

const features: Feature[] = [
  {
    icon: Binary,
    title: "Single binary",
    description:
      "Resolver, dashboard, auth and blocklist engine in one 6.8 MB executable. No runtime dependencies, no cgo, no installer roulette.",
    span: "lg:col-span-2",
  },
  {
    icon: LayoutDashboard,
    title: "Web dashboard",
    description:
      "Real-time monitoring, live query stream, cache management and report exports. Dark and light theme, on 127.0.0.1:9153.",
  },
  {
    icon: ShieldCheck,
    title: "DNSSEC validation",
    description:
      "Full chain from the root KSK — RSA, ECDSA P-256/P-384, Ed25519 — with aggressive NSEC/NSEC3 synthesis (RFC 8198).",
  },
  {
    icon: Ban,
    title: "DNS blocklist",
    description:
      "Pi-hole style blocking with hosts, domain and AdBlock Plus list formats, auto-refreshed on a schedule you set.",
  },
  {
    icon: Lock,
    title: "Encrypted transports",
    description:
      "DoT on :853, DoH and DoH3 on the web endpoint, EDNS padding on encrypted transports. One flag each in labyrinth.yaml.",
    span: "lg:col-span-2",
    chips: ["UDP :53", "TCP :53", "DoT :853", "DoH", "DoH3"],
  },
  {
    icon: Gauge,
    title: "Hardened",
    description:
      "Bailiwick enforcement (RFC 5452), rate limiting, response rate limiting, and NSEC3 hash budgets that close CVE-2023-50387 / 50868.",
  },
  {
    icon: Radio,
    title: "Observable",
    description:
      "Prometheus metrics, a native Zabbix agent, structured JSON logs and a WebSocket query stream — with RFC-compliance counters.",
  },
  {
    icon: RefreshCw,
    title: "Self-updating",
    description:
      "Version check and one-click update from the dashboard. Read-only installs update at the host level.",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <div
      className={cn(
        "feature-entry group relative flex h-full flex-col border-t border-border py-7 transition-colors",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">
          /{String(index + 1).padStart(2, "0")}
        </span>
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="mt-6 text-xl font-medium tracking-tight">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {feature.description}
      </p>
      {feature.chips ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {feature.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border bg-raised px-2.5 py-1 font-mono text-xs text-muted"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="features-section scroll-mt-24 section-space">
      <div className="site-container">
        <div className="features-intro">
          <Reveal>
            <SectionHeading
              eyebrow="01 · Features"
              title={
                <>
                  Small footprint.
                  <br />
                  <span className="font-display italic text-primary">
                    Nothing left out.
                  </span>
                </>
              }
              description="The resolver, the protection, the visibility. Everything ships together — no plugins to assemble or services to babysit."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="binary-blueprint">
              <div className="binary-outline outline-back" />
              <div className="binary-outline outline-middle" />
              <div className="binary-face">
                <span className="eyebrow">labyrinth / executable</span>
                <MazeGlyph className="text-primary" />
                <div>
                  <strong>
                    6.8 <span>MB</span>
                  </strong>
                  <span className="eyebrow">One file. Every layer.</span>
                </div>
              </div>
              <span className="blueprint-caption">
                RESOLVE / VALIDATE / OBSERVE
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={0.05 * (i % 3)}
              className="h-full"
            >
              <FeatureCard feature={feature} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
