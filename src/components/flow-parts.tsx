"use client";

import { memo } from "react";
import { useReducedMotion } from "motion/react";
import {
  getBezierPath,
  Handle,
  Position,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Globe, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MazeGlyph } from "@/components/maze-glyph";

/* Custom React Flow parts for the resolution trace:
   - three custom node kinds (client / labyrinth / server)
   - a "thread" edge that carries the query bead and keeps the
     traversed path lit — Ariadne's thread stays behind you. */

export type FlowNodeState = "idle" | "active" | "done";
export type ThreadDir = "out" | "in";

type CommonData = {
  title: string;
  subtitle?: string;
  state?: FlowNodeState;
};

export type ClientFlowNode = Node<
  CommonData & Record<string, unknown>,
  "client"
>;
export type LabyrinthFlowNode = Node<
  CommonData & { chips?: string[] } & Record<string, unknown>,
  "labyrinth"
>;
export type ServerFlowNode = Node<
  CommonData & Record<string, unknown>,
  "server"
>;
export type TraceNode = ClientFlowNode | LabyrinthFlowNode | ServerFlowNode;

export type ThreadEdgeData = {
  state?: FlowNodeState;
  dir?: ThreadDir;
} & Record<string, unknown>;
export type ThreadEdgeType = Edge<ThreadEdgeData, "thread">;

function shell(state: FlowNodeState | undefined): string {
  return cn(
    "relative rounded-lg border bg-surface px-4 py-3 text-left transition-all duration-300",
    state === "active" &&
      "border-primary shadow-[0_0_0_1px_var(--primary),0_0_36px_-6px_var(--primary)]",
    state === "done" && "border-primary/50",
    (!state || state === "idle") && "border-border",
  );
}

export const ClientNode = memo(function ClientNode({
  data,
}: NodeProps<ClientFlowNode>) {
  return (
    <div className={shell(data.state)}>
      <Handle id="out" type="source" position={Position.Right} />
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-raised text-primary">
          <Terminal className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold">{data.title}</span>
          <span className="block font-mono text-[11px] text-muted">
            {data.subtitle}
          </span>
        </span>
      </div>
    </div>
  );
});

export const LabyrinthNode = memo(function LabyrinthNode({
  data,
}: NodeProps<LabyrinthFlowNode>) {
  return (
    <div className={cn(shell(data.state), "px-5 py-4")}>
      <Handle id="in" type="target" position={Position.Left} />
      <Handle id="out" type="source" position={Position.Right} />
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
          <MazeGlyph className="size-5" />
        </span>
        <span>
          <span className="block font-display text-base font-bold">
            {data.title}
          </span>
          <span className="block font-mono text-[11px] text-muted">
            {data.subtitle}
          </span>
        </span>
      </div>
      {data.chips ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.chips.map((chip) => (
            <span
              key={chip}
              className="rounded border border-border bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
});

export const ServerNode = memo(function ServerNode({
  data,
}: NodeProps<ServerFlowNode>) {
  return (
    <div className={shell(data.state)}>
      <Handle id="in" type="target" position={Position.Left} />
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-raised text-muted">
          <Globe className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold">{data.title}</span>
          <span className="block font-mono text-[11px] text-muted">
            {data.subtitle}
          </span>
        </span>
      </div>
    </div>
  );
});

/* The thread: neutral hairline when idle; gold when traversed; a travelling
   bead while active. `dir` sends the bead back along the reversed path for
   response steps. */

export const ThreadEdge = memo(function ThreadEdge(
  props: EdgeProps<ThreadEdgeType>,
) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;
  const reduce = useReducedMotion();

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [reversePath] = getBezierPath({
    sourceX: targetX,
    sourceY: targetY,
    sourcePosition: targetPosition,
    targetX: sourceX,
    targetY: sourceY,
    targetPosition: sourcePosition,
  });

  const state = data?.state ?? "idle";
  if (state === "idle") {
    return (
      <path
        id={id}
        d={path}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
    );
  }

  const done = state === "done";
  const beadPath = data?.dir === "in" ? reversePath : path;

  return (
    <>
      <path
        id={id}
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={done ? 1.75 : 2.5}
        opacity={done ? 0.7 : 1}
        className={done ? undefined : "thread-dash"}
      />
      {state === "active" && !reduce && (
        <circle r="5" fill="var(--primary)" stroke="var(--bg)" strokeWidth={1.5}>
          <animateMotion dur="0.95s" repeatCount="indefinite" path={beadPath} />
        </circle>
      )}
    </>
  );
});
