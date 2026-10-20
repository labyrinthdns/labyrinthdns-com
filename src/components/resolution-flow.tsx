"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import {
  ClientNode,
  LabyrinthNode,
  ServerNode,
  ThreadEdge,
  type FlowNodeState,
  type ThreadDir,
  type ThreadEdgeType,
  type TraceNode,
} from "@/components/flow-parts";

/* ---- Trace data ------------------------------------------------------ */
const subscribeNoop = () => () => {};
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const isPageVisible = () => !document.hidden;
const serverHidden = () => false;

type Step = {
  node?: string;
  edge?: string;
  dir?: ThreadDir;
  label: string;
  log: string;
};

const steps: Step[] = [
  {
    edge: "e-client",
    dir: "out",
    node: "labyrinth",
    label: "Query",
    log: "→ dig example.com A arrives on :53 (UDP)",
  },
  {
    node: "labyrinth",
    label: "Blocklist",
    log: "✓ blocklist miss — example.com is not filtered",
  },
  {
    node: "labyrinth",
    label: "Cache",
    log: "· cache miss across 256 shards — resolve iteratively",
  },
  {
    edge: "e-root",
    dir: "out",
    node: "root",
    label: "Root",
    log: "→ QNAME-minimized query to a.root-servers.net",
  },
  {
    edge: "e-root",
    dir: "in",
    node: "labyrinth",
    label: "Referral",
    log: "← referral: ask the .com nameservers",
  },
  {
    edge: "e-tld",
    dir: "out",
    node: "tld",
    label: "TLD",
    log: "→ ask a.gtld-servers.net for example.com",
  },
  {
    edge: "e-tld",
    dir: "in",
    node: "labyrinth",
    label: "Referral",
    log: "← referral: ask ns1.example.com directly",
  },
  {
    edge: "e-auth",
    dir: "out",
    node: "auth",
    label: "Authoritative",
    log: "→ ask ns1.example.com for example.com A",
  },
  {
    edge: "e-auth",
    dir: "in",
    node: "labyrinth",
    label: "Answer",
    log: "← A 93.184.216.34 + RRSIG (example.com)",
  },
  {
    node: "labyrinth",
    label: "Validate",
    log: "✓ DNSSEC chain verified — root KSK → .com DS → example.com RRSIG",
  },
  {
    edge: "e-client",
    dir: "in",
    node: "client",
    label: "Respond",
    log: "→ validated answer sent, AD bit set — 34 ms total",
  },
];

const initialNodes: TraceNode[] = [
  {
    id: "client",
    type: "client",
    position: { x: 0, y: 150 },
    data: { title: "Client", subtitle: "dig @10.0.0.1 example.com" },
  },
  {
    id: "labyrinth",
    type: "labyrinth",
    position: { x: 270, y: 120 },
    data: {
      title: "Labyrinth",
      subtitle: ":53 · :853 · /dns-query",
      chips: ["blocklist", "cache", "qname-min", "dnssec"],
    },
  },
  {
    id: "root",
    type: "server",
    position: { x: 640, y: 0 },
    data: { title: "Root", subtitle: "a.root-servers.net" },
  },
  {
    id: "tld",
    type: "server",
    position: { x: 660, y: 150 },
    data: { title: ".com TLD", subtitle: "a.gtld-servers.net" },
  },
  {
    id: "auth",
    type: "server",
    position: { x: 640, y: 300 },
    data: { title: "Authoritative", subtitle: "ns1.example.com" },
  },
];

const initialEdges: ThreadEdgeType[] = [
  {
    id: "e-client",
    source: "client",
    target: "labyrinth",
    type: "thread",
    data: { state: "idle", dir: "out" },
  },
  {
    id: "e-root",
    source: "labyrinth",
    target: "root",
    type: "thread",
    data: { state: "idle", dir: "out" },
  },
  {
    id: "e-tld",
    source: "labyrinth",
    target: "tld",
    type: "thread",
    data: { state: "idle", dir: "out" },
  },
  {
    id: "e-auth",
    source: "labyrinth",
    target: "auth",
    type: "thread",
    data: { state: "idle", dir: "out" },
  },
];

const nodeTypes: NodeTypes = {
  client: ClientNode,
  labyrinth: LabyrinthNode,
  server: ServerNode,
};

const edgeTypes: EdgeTypes = {
  thread: ThreadEdge,
};

function deriveStates(stepIndex: number) {
  const nodeStates = new Map<string, FlowNodeState>();
  const edgeStates = new Map<
    string,
    { state: FlowNodeState; dir: ThreadDir }
  >();
  steps.forEach((step, i) => {
    if (i > stepIndex) return;
    const state: FlowNodeState = i === stepIndex ? "active" : "done";
    if (step.node) nodeStates.set(step.node, state);
    if (step.edge) edgeStates.set(step.edge, { state, dir: step.dir ?? "out" });
  });
  return { nodeStates, edgeStates };
}

function logColor(log: string): string {
  if (log.startsWith("✓")) return "text-success";
  if (log.startsWith("→")) return "text-fg";
  return "text-muted";
}

const pad = (n: number) => String(n).padStart(2, "0");
const fitViewOptions = { padding: 0.18, maxZoom: 1 };

/* ---- Component ------------------------------------------------------- */

export function ResolutionFlow() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<TraceNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<ThreadEdgeType>(initialEdges);
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const started = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const flowInstance = useRef<ReactFlowInstance<
    TraceNode,
    ThreadEdgeType
  > | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(canvasRef, { margin: "160px" });
  const pageVisible = useSyncExternalStore(subscribeVisibility, isPageVisible, serverHidden);
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Refit only when the canvas changes size, preserving manual pan/zoom otherwise.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void flowInstance.current?.fitView(fitViewOptions);
      });
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // Auto-start once the diagram scrolls into view (never for reduced motion).
  useEffect(() => {
    if (!inView || started.current || reduce) return;
    started.current = true;
    setStepIndex(0);
    setPlaying(true);
  }, [inView, reduce]);

  // Auto-advance through the trace. The guard leaves `playing` on at the end;
  // the button flips to "Replay" via the derived `finished` flag, so this
  // effect never sets state synchronously.
  useEffect(() => {
    if (!playing || !inView || !pageVisible || stepIndex < 0 || stepIndex >= steps.length - 1) return;
    const timer = setTimeout(() => setStepIndex((s) => s + 1), 1150);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, inView, pageVisible]);

  // Apply the derived node/edge states for the current step.
  useEffect(() => {
    const { nodeStates, edgeStates } = deriveStates(stepIndex);
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: { ...n.data, state: nodeStates.get(n.id) ?? "idle" },
      })),
    );
    setEdges((es) =>
      es.map((e) => {
        const s = edgeStates.get(e.id);
        return {
          ...e,
          data: { ...e.data, state: s?.state ?? "idle", dir: s?.dir ?? "out", running: playing && inView && pageVisible },
        };
      }),
    );
  }, [stepIndex, setNodes, setEdges, playing, inView, pageVisible]);

  // Keep the newest log line visible.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [stepIndex]);

  const play = () => {
    started.current = true;
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setPlaying(true);
      return;
    }
    if (stepIndex < 0) setStepIndex(0);
    setPlaying((p) => !p);
  };

  const finished = stepIndex >= steps.length - 1;
  const buttonLabel = finished
    ? "Replay"
    : playing
      ? "Pause"
      : stepIndex < 0
        ? "Play trace"
        : "Resume";
  const ButtonIcon = finished ? RotateCcw : playing ? Pause : Play;

  const miniNodeColor = (node: TraceNode) => {
    const state = node.data.state;
    if (state === "active") return "var(--primary)";
    if (state === "done")
      return "color-mix(in oklab, var(--primary) 55%, var(--surface))";
    return "var(--border)";
  };

  return (
    <section
      id="resolution"
      ref={sectionRef}
      className="scroll-mt-24 border-t border-border section-space"
    >
      <div className="site-container resolution-workspace">
        <Reveal>
          <SectionHeading
            eyebrow="03 · Interactive"
            title="Follow a query through the labyrinth."
            description="No mystery upstream. Watch a lookup travel through the root, TLD and authoritative servers, then return with a validated answer. Press play or drag the nodes to explore."
          />
        </Reveal>

        <Reveal delay={0.1} className="resolution-canvas">
          <div
            ref={canvasRef}
            className="resolution-diagram relative overflow-hidden rounded-xl border border-border bg-surface/60"
          >
            <ReactFlow
              onInit={(instance) => {
                flowInstance.current = instance;
              }}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              colorMode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
              fitView
              fitViewOptions={fitViewOptions}
              minZoom={0.2}
              maxZoom={1.6}
              nodesConnectable={false}
              deleteKeyCode={null}
              zoomOnScroll={false}
              panOnScroll={false}
              zoomOnPinch
              aria-label="Interactive DNS resolution trace"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={26}
                size={1.4}
                color="var(--border)"
              />
              <Controls showInteractive={false} position="bottom-left" />
              <MiniMap
                position="bottom-right"
                pannable
                zoomable
                nodeColor={miniNodeColor}
                nodeStrokeColor="var(--border)"
                className="!hidden md:!block"
              />
            </ReactFlow>

            {/* Step indicator */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-border bg-surface/90 px-3 py-2 font-mono text-xs text-muted backdrop-blur-sm">
              {stepIndex >= 0 ? (
                <>
                  step {pad(stepIndex + 1)}/{pad(steps.length)} —{" "}
                  <span className="text-fg">{steps[stepIndex].label}</span>
                </>
              ) : (
                "ready — press play"
              )}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 hidden rounded-md border border-border bg-surface/90 px-3 py-2 font-mono text-xs text-muted backdrop-blur-sm sm:block">
              drag nodes · pinch or ⊕⊖ to zoom
            </div>
          </div>
        </Reveal>

        {/* Controls + step log */}
        <Reveal delay={0.15} className="resolution-details">
          <div className="mt-4 flex flex-col gap-4 lg:flex-row">
            <div className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
              <button
                type="button"
                onClick={play}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
              >
                <ButtonIcon className="size-4" />
                {buttonLabel}
              </button>
              <div className="font-mono text-xs tabular-nums text-muted">
                {pad(Math.max(stepIndex + 1, 0))} / {pad(steps.length)} steps
                <span className="mt-1 block text-[11px] opacity-80">
                  ~1.4 µs cached · 34 ms cold
                </span>
              </div>
            </div>

            <div
              ref={logRef}
              className="h-44 flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed sm:text-sm"
              role="log"
              aria-label="Resolution trace log"
            >
              {stepIndex < 0 ? (
                <p className="text-muted">waiting for the first query…</p>
              ) : (
                <AnimatePresence initial={false}>
                  {steps.slice(0, stepIndex + 1).map((step, i) => (
                    <motion.p
                      key={i}
                      initial={reduce ? false : { opacity: 1, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn("mt-1.5 first:mt-0", logColor(step.log))}
                    >
                      <span className="mr-2 text-muted">{pad(i + 1)}</span>
                      {step.log}
                    </motion.p>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-4 font-mono text-xs text-muted">
            Drawn with @xyflow/react · the trace is illustrative, the pipeline
            is real.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
