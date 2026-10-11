"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type Bench = {
  op: string;
  ops: string;
  opsValue: number;
  latency: string;
};

const benches: Bench[] = [
  { op: "Cache get", ops: "22M ops/s", opsValue: 22, latency: "45 ns" },
  { op: "Name decode", ops: "22.6M ops/s", opsValue: 22.6, latency: "44 ns" },
  { op: "Cache set", ops: "19M ops/s", opsValue: 19, latency: "53 ns" },
  { op: "Wire unpack", ops: "4.4M ops/s", opsValue: 4.4, latency: "225 ns" },
  { op: "Wire pack", ops: "2.6M ops/s", opsValue: 2.6, latency: "391 ns" },
  { op: "FNV-1a hash", ops: "331M ops/s", opsValue: 331, latency: "3 ns" },
  {
    op: "Full resolve (cached)",
    ops: "700K ops/s",
    opsValue: 0.7,
    latency: "1.4 µs",
  },
];

const MAX = 331;
// Square-root scale keeps the 331M hash bar from flattening everything else.
const barWidth = (v: number) => `${Math.sqrt(v / MAX) * 100}%`;

const why = [
  {
    title: "256-shard cache",
    body: "Lock-striped shards keep reads parallel across cores — 22M cache reads per second without contention.",
  },
  {
    title: "Request coalescing",
    body: "Identical in-flight queries share a single upstream flight instead of stampeding the authoritative servers.",
  },
  {
    title: "Fast by default",
    body: "QNAME minimisation and DNSSEC validation on out of the box, with cache TTLs you can tune live from the dashboard.",
  },
];

export function Performance() {
  const reduce = useReducedMotion();

  return (
    <section
      id="performance"
      className="scroll-mt-24 border-t border-border py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="04 · Performance"
                title="Benchmarked, not bragged."
                description="Numbers from labyrinth-bench on a single AMD Ryzen 9 9950X3D thread. Run the same benchmark yourself — it ships with every release."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-10 space-y-6">
                {why.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-px w-8 shrink-0 bg-primary"
                    />
                    <div>
                      <h3 className="font-mono text-sm font-medium text-fg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
              <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border pb-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>Operation</span>
                <span className="text-right">Throughput · latency</span>
              </div>
              {benches.map((bench, i) => (
                <div
                  key={bench.op}
                  className="border-b border-border/50 py-3.5 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium">{bench.op}</span>
                    <span className="font-mono text-xs tabular-nums text-muted sm:text-sm">
                      {bench.ops} ·{" "}
                      <span className="text-fg">{bench.latency}</span>
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised"
                    role="presentation"
                  >
                    <motion.div
                      style={{
                        width: barWidth(bench.opsValue),
                        transformOrigin: "left",
                      }}
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: reduce ? 0 : 0.9,
                        delay: reduce ? 0 : 0.05 * i,
                        ease: [0.2, 0, 0, 1],
                      }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
              <p className="mt-4 font-mono text-xs text-muted">
                AMD Ryzen 9 9950X3D · labyrinth-bench · single thread ·
                cache-entry latencies in ns, resolve in µs
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
