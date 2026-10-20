"use client";

import { useState } from "react";
import { Tabs } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type Coverage = "Full" | "Pinned" | "Planned";

type RfcRow = {
  rfc: string;
  title: string;
  coverage: Coverage;
};

type RfcGroup = {
  id: string;
  label: string;
  rows: RfcRow[];
};

const groups: RfcGroup[] = [
  {
    id: "core",
    label: "Core protocol",
    rows: [
      { rfc: "1034 / 1035", title: "Domain names — concepts + implementation", coverage: "Full" },
      { rfc: "1034 §3.7", title: "AA bit clear on resolver responses", coverage: "Pinned" },
      { rfc: "1035 §2.3.4", title: "Label and name length caps (63 / 255)", coverage: "Pinned" },
      { rfc: "2181", title: "DNS clarifications", coverage: "Full" },
      { rfc: "2308 §5", title: "Negative cache TTL = MIN(SOA TTL, SOA.MINIMUM)", coverage: "Pinned" },
      { rfc: "3596", title: "AAAA records", coverage: "Full" },
      { rfc: "3597", title: "Handling unknown RR types", coverage: "Full" },
      { rfc: "5452 §3", title: "In-bailiwick sanitisation", coverage: "Pinned" },
      { rfc: "5452 §6", title: "DNS 0x20 case randomisation", coverage: "Pinned" },
      { rfc: "6604 / 6672", title: "xNAME RCODE + DNAME redirection", coverage: "Full" },
      { rfc: "9156", title: "QNAME minimisation", coverage: "Full" },
      { rfc: "9460", title: "SVCB / HTTPS resource records", coverage: "Full" },
    ],
  },
  {
    id: "dnssec",
    label: "DNSSEC",
    rows: [
      { rfc: "4033 – 4035", title: "DNSSEC core", coverage: "Full" },
      { rfc: "4034 §2.1.1", title: "DNSKEY Zone Key bit gating", coverage: "Pinned" },
      { rfc: "4035 §3.2.1", title: "DNSSEC RR stripping for non-DO clients", coverage: "Pinned" },
      { rfc: "4035 §3.2.2", title: "AD bit gating with CD truth-table", coverage: "Pinned" },
      { rfc: "4035 §4.7", title: "DO bit on outbound queries", coverage: "Pinned" },
      { rfc: "4509 §2.4", title: "DS digest type 0 unconditionally rejected", coverage: "Pinned" },
      { rfc: "5011", title: "Automated trust anchor updates", coverage: "Full" },
      { rfc: "5155", title: "NSEC3 hashed denial", coverage: "Full" },
      { rfc: "6605", title: "ECDSA P-256 / P-384", coverage: "Full" },
      { rfc: "6840 §5.9", title: "CD bit propagation on forward queries", coverage: "Pinned" },
      { rfc: "6975", title: "DAU / DHU / N3U algorithm signalling", coverage: "Full" },
      { rfc: "8198 §5.2 / §5.4", title: "Aggressive NSEC / NSEC3 synthesis", coverage: "Pinned" },
      { rfc: "8624 §3.1 / §3.3", title: "MUST-NOT algorithm refusal (RSAMD5 / DSA / SHA-1)", coverage: "Pinned" },
      { rfc: "9018", title: "Cookie key serialisation", coverage: "Full" },
      { rfc: "9276 §3.2", title: "NSEC3 iteration cap at 100", coverage: "Pinned" },
    ],
  },
  {
    id: "edns",
    label: "EDNS & cookies",
    rows: [
      { rfc: "6891 §6.1.3", title: "Extended RCODE pack/unpack (BADCOOKIE / BADVERS)", coverage: "Pinned" },
      { rfc: "7828", title: "edns-tcp-keepalive", coverage: "Full" },
      { rfc: "7830 + 8467", title: "EDNS padding on DoT / DoH (468-byte block)", coverage: "Full" },
      { rfc: "7871", title: "Client Subnet (ECS)", coverage: "Full" },
      { rfc: "7873 §5.2 – 5.4", title: "Server-cookie cache + BADCOOKIE retry", coverage: "Pinned" },
      { rfc: "7873 §5.5", title: "Cookie secret rotation", coverage: "Pinned" },
    ],
  },
  {
    id: "transport",
    label: "Transport security",
    rows: [
      { rfc: "7766 §6.2", title: "TCP pipelining + idle timeout bounds", coverage: "Pinned" },
      { rfc: "7858", title: "DNS over TLS (DoT)", coverage: "Full" },
      { rfc: "8484", title: "DNS over HTTPS (DoH)", coverage: "Full" },
      { rfc: "9210 §3.7", title: "TCP idle timeout safety bounds", coverage: "Pinned" },
      { rfc: "9250", title: "DNS over QUIC (DoQ)", coverage: "Planned" },
    ],
  },
  {
    id: "special",
    label: "Special-use names",
    rows: [
      { rfc: "6303", title: "Locally-served reverse zones (RFC 1918, IPv6 ULA, link-local)", coverage: "Full" },
      { rfc: "6761 / 6762 / 7686 / 8375", title: "Special-use domain names", coverage: "Full" },
    ],
  },
  {
    id: "policy",
    label: "Errors & caching",
    rows: [
      { rfc: "8914 §3", title: "EDE only when client carries EDNS", coverage: "Pinned" },
      { rfc: "8914 §4.17 / 4.18", title: "EDE 17 Filtered / EDE 18 Prohibited on REFUSED", coverage: "Pinned" },
      { rfc: "8914 §4.29", title: "EDE 29 Synthesized (aggressive NSEC / NSEC3)", coverage: "Pinned" },
      { rfc: "8767 §3.1", title: "Stale-while-refresh", coverage: "Pinned" },
      { rfc: "8659", title: "DNS CAA pass-through", coverage: "Full" },
      { rfc: "9520", title: "Resolution failure caching", coverage: "Pinned" },
    ],
  },
];

const coverageStyle: Record<Coverage, string> = {
  Full: "border-success/40 bg-success/10 text-success",
  Pinned: "border-primary/40 bg-primary/10 text-primary",
  Planned: "border-border bg-raised text-muted",
};

const coverageNote: Record<Coverage, string> = {
  Full: "Full implementation",
  Pinned: "Behaviour pinned by test",
  Planned: "Not yet implemented",
};

function RfcTable({ rows }: { rows: RfcRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {rows.map((row) => (
        <div
          key={row.rfc + row.title}
          className="grid gap-x-4 gap-y-1 border-b border-border/50 px-4 py-3 last:border-b-0 sm:grid-cols-[130px_1fr_auto] sm:items-center sm:px-5"
        >
          <span className="font-mono text-xs font-medium text-primary">
            RFC {row.rfc}
          </span>
          <span className="text-sm leading-snug text-fg">{row.title}</span>
          <span
            title={coverageNote[row.coverage]}
            className={cn(
              "justify-self-start rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide sm:justify-self-end",
              coverageStyle[row.coverage],
            )}
          >
            {row.coverage === "Planned" ? "Not yet" : row.coverage}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RfcMatrix() {
  const [active, setActive] = useState(groups[0].id);
  const reduce = useReducedMotion();

  return (
    <section id="rfcs" className="scroll-mt-24 border-t border-border section-space">
      <div className="site-container section-split">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="05 · Standards"
            title="Forty-some RFCs, pinned by tests."
            description="About 45 standards across nine capability groups. Each row is backed by a behavioural pin test under the rfcNNNN_*_test.go convention — a regression fails the suite instead of silently degrading the resolver."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs.Root
            value={active}
            onValueChange={setActive}
            className="section-panel"
          >
            <Tabs.List
              aria-label="RFC capability groups"
              className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1"
            >
              {groups.map((group) => (
                <Tabs.Trigger
                  key={group.id}
                  value={group.id}
                  className="shrink-0 rounded-md px-3.5 py-2 text-sm text-muted transition-colors hover:text-fg data-[state=active]:bg-raised data-[state=active]:text-fg"
                >
                  {group.label}
                  <span className="ml-2 font-mono text-xs text-muted">
                    {group.rows.length}
                  </span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {groups.map((group) => (
              <Tabs.Content key={group.id} value={group.id} className="mt-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={group.id}
                    initial={reduce ? false : { opacity: 1, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  >
                    <RfcTable rows={group.rows} />
                  </motion.div>
                </AnimatePresence>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-center font-mono text-xs text-muted">
            Full matrix with per-entry IETF datatracker links lives on the
            dashboard’s About page.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
