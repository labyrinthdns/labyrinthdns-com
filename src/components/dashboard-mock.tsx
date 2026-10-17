"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  Activity,
  Ban,
  Database,
  LayoutDashboard,
  ListTree,
  Pause,
  Play,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type QueryStatus = "ok" | "cache" | "blocked";

type QueryRow = {
  id: number;
  domain: string;
  type: string;
  ms: number;
  status: QueryStatus;
};

const pool: Array<Omit<QueryRow, "id">> = [
  { domain: "github.com", type: "A", ms: 34, status: "ok" },
  { domain: "cdn.jsdelivr.net", type: "AAAA", ms: 8, status: "cache" },
  { domain: "ads.tracker.net", type: "A", ms: 1, status: "blocked" },
  { domain: "api.githubusercontent.com", type: "A", ms: 51, status: "ok" },
  { domain: "registry.npmjs.org", type: "A", ms: 12, status: "cache" },
  { domain: "telemetry.example.io", type: "AAAA", ms: 1, status: "blocked" },
  { domain: "fonts.gstatic.com", type: "A", ms: 9, status: "cache" },
  { domain: "www.wikipedia.org", type: "A", ms: 47, status: "ok" },
  { domain: "cdn.cloudflare.net", type: "AAAA", ms: 11, status: "cache" },
  { domain: "metrics.sniffly.dev", type: "A", ms: 1, status: "blocked" },
  { domain: "duckduckgo.com", type: "A", ms: 38, status: "ok" },
  { domain: "upload.wikimedia.org", type: "AAAA", ms: 10, status: "cache" },
];

const initialRows: QueryRow[] = pool.slice(0, 5).map((row, i) => ({
  ...row,
  id: i,
}));

const sidebar = [
  { icon: ListTree, label: "All queries", filter: "all" },
  { icon: Database, label: "Cache hits", filter: "cache" },
  { icon: Ban, label: "Blocked", filter: "blocked" },
] as const;

const statusStyle: Record<QueryStatus, string> = {
  ok: "border-success/30 bg-success/10 text-success",
  cache: "border-primary/30 bg-primary/10 text-primary",
  blocked: "border-danger/30 bg-danger/10 text-danger",
};

const statusLabel: Record<QueryStatus, string> = {
  ok: "NOERROR",
  cache: "CACHE",
  blocked: "BLOCKED",
};

function format(n: number): string {
  return n.toLocaleString("en-US");
}

export function DashboardMock() {
  const [rows, setRows] = useState<QueryRow[]>(initialRows);
  const [playing, setPlaying] = useState(true);
  const [qpm, setQpm] = useState(1240);
  const [blocked, setBlocked] = useState(1204);
  const [filter, setFilter] = useState<"all" | "cache" | "blocked">("all");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "160px" });
  const counter = useRef(initialRows.length);
  const visibleRows = rows.filter(
    (row) => filter === "all" || row.status === filter,
  );

  // Live query stream (client-side only; deterministic initial render).
  useEffect(() => {
    if (!playing || reduce || !inView) return;
    const timer = setInterval(() => {
      counter.current += 1;
      const next = pool[counter.current % pool.length];
      setRows((prev) =>
        [{ ...next, id: counter.current }, ...prev].slice(0, 7),
      );
    }, 1500);
    return () => clearInterval(timer);
  }, [playing, reduce, inView]);

  // Slow drift on the headline counters.
  useEffect(() => {
    if (reduce || !playing || !inView) return;
    const timer = setInterval(() => {
      setQpm((v) => Math.max(900, v + Math.round((Math.random() - 0.45) * 90)));
      setBlocked((v) => (Math.random() > 0.6 ? v + 1 : v));
    }, 2000);
    return () => clearInterval(timer);
  }, [reduce, playing, inView]);

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="scroll-mt-24 border-t border-border section-space"
    >
      <div className="site-container">
        <Reveal>
          <SectionHeading
            eyebrow="02 · Dashboard"
            title={
              <>
                Your network.
                <br />
                <span className="font-display italic text-primary">
                  In plain sight.
                </span>
              </>
            }
            description="See what’s resolving, what’s cached and what’s blocked. A live query stream and a built-in dashboard, without another service to deploy. Explore the preview below."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="dashboard-frame mt-12 overflow-hidden border border-border bg-surface">
            {/* Title bar */}
            <div className="flex h-11 items-center gap-3 border-b border-border bg-raised/50 px-4">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-border" />
                <span className="size-3 rounded-full bg-border" />
                <span className="size-3 rounded-full bg-border" />
              </span>
              <span className="truncate font-mono text-xs text-muted">
                labyrinth — 127.0.0.1:9153
              </span>
              <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[10px] text-muted sm:flex">
                <span className="size-1.5 rounded-full bg-success" />
                admin@labyrinth
              </span>
            </div>

            <div className="grid md:grid-cols-[190px_1fr]">
              {/* Sidebar */}
              <nav
                aria-label="Dashboard preview filters"
                className="hidden flex-col gap-1 border-r border-border p-3 md:flex"
              >
                <div className="demo-sidebar-title">
                  <LayoutDashboard size={16} />
                  <span>Query explorer</span>
                </div>
                <p className="demo-sidebar-label">FILTER THE PREVIEW</p>
                {sidebar.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    aria-pressed={filter === item.filter}
                    onClick={() => setFilter(item.filter)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
                      filter === item.filter
                        ? "border-l-2 border-primary bg-raised font-medium text-fg"
                        : "border-l-2 border-transparent text-muted",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                ))}
                <div className="demo-reference">
                  <p className="demo-sidebar-label">READ THE GUIDES</p>
                  <Link href="/docs/monitoring">
                    <Activity size={14} />
                    Monitoring
                    <ArrowUpRight size={12} />
                  </Link>
                  <Link href="/docs/configuration">
                    <Settings size={14} />
                    Configuration
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              </nav>

              {/* Main */}
              <div className="p-4 sm:p-6">
                <div className="demo-workspace-heading">
                  <div>
                    <p className="eyebrow">A window into your resolver</p>
                    <h3>Every answer has a story.</h3>
                  </div>
                  <span className="demo-preview-badge">
                    INTERACTIVE PREVIEW
                  </span>
                </div>
                {/* Stat matrix */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-raised/40 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Queries / min
                    </p>
                    <p className="mt-1.5 font-mono text-2xl tabular-nums">
                      {format(qpm)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-raised/40 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Cache hit ratio
                    </p>
                    <p className="mt-1.5 font-mono text-2xl tabular-nums">
                      87<span className="text-primary">%</span>
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                      <motion.div
                        style={{ width: "87%", transformOrigin: "left" }}
                        initial={reduce ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-raised/40 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Blocked today
                    </p>
                    <p className="mt-1.5 font-mono text-2xl tabular-nums text-danger">
                      {format(blocked)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-raised/40 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      Upstream p50
                    </p>
                    <p className="mt-1.5 font-mono text-2xl tabular-nums">
                      12<span className="text-primary"> ms</span>
                    </p>
                  </div>
                </div>

                {/* Live stream */}
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <div className="flex items-center gap-3 border-b border-border bg-raised/40 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                      <span className="relative flex size-1.5">
                        {playing && !reduce && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                        )}
                        <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                      </span>
                      ws · live queries
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlaying((p) => !p)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
                      aria-pressed={!playing ? "true" : "false"}
                    >
                      {playing ? (
                        <>
                          <Pause className="size-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-3" /> Resume
                        </>
                      )}
                    </button>
                  </div>

                  <div className="demo-filter-bar">
                    <div role="group" aria-label="Query filters">
                      {sidebar.map((item) => (
                        <button
                          key={item.filter}
                          type="button"
                          aria-pressed={filter === item.filter}
                          onClick={() => setFilter(item.filter)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <span>{visibleRows.length} shown</span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                    <span>Query</span>
                    <span className="text-right">Time · Status</span>
                  </div>

                  <div className="h-[268px] overflow-hidden">
                    <AnimatePresence initial={false} mode="popLayout">
                      {visibleRows.map((row) => (
                        <motion.div
                          key={row.id}
                          layout
                          initial={reduce ? false : { opacity: 0, y: -14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                          className="grid grid-cols-[1fr_auto] items-center gap-x-4 border-b border-border/40 px-4 py-2.5 font-mono text-xs"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="truncate text-fg">
                              {row.domain}
                            </span>
                            <span className="shrink-0 rounded border border-border px-1 py-px text-[10px] text-muted">
                              {row.type}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3 tabular-nums">
                            <span className="text-muted">{row.ms} ms</span>
                            <span
                              className={cn(
                                "rounded border px-1.5 py-0.5 text-[10px]",
                                statusStyle[row.status],
                              )}
                            >
                              {statusLabel[row.status]}
                            </span>
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {visibleRows.length === 0 && (
                      <p className="demo-empty">
                        No matching queries in this preview window. Try another
                        filter or resume the stream.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-4 text-center font-mono text-xs text-muted">
            A redrawn impression of the built-in dashboard — illustrative
            numbers, real layout.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
