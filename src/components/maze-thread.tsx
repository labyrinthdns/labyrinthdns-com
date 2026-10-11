"use client";

import { useId, useMemo } from "react";
import { useReducedMotion } from "motion/react";

/* The hero labyrinth — circular, drawn from scratch:
   concentric ring-walls with offset openings that slowly counter-rotate
   (the maze rearranges itself), and Ariadne's golden thread — an
   Archimedean spiral from the outer edge to the heart — carrying query
   beads to the glowing answer at the center. All layers are reduced-motion
   aware; the hero adds spring-based pointer parallax around this component. */

const CENTER = 300;

type Ring = {
  r: number;
  gap: number;
  phase: number;
  dur: number;
  ccw?: boolean;
};

const RINGS: Ring[] = [
  { r: 70, gap: 0.26, phase: 0.11, dur: 64 },
  { r: 112, gap: 0.22, phase: 0.47, dur: 84, ccw: true },
  { r: 154, gap: 0.22, phase: 0.83, dur: 74 },
  { r: 196, gap: 0.2, phase: 0.29, dur: 96, ccw: true },
  { r: 238, gap: 0.2, phase: 0.65, dur: 82 },
  { r: 280, gap: 0.3, phase: 0.05, dur: 110, ccw: true },
];

/* Archimedean spiral from the outer edge down to the heart. */
function buildSpiral(): string {
  const turns = 5.6;
  const steps = 420;
  const r0 = 280;
  const r1 = 16;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = -Math.PI / 2 + t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join("");
}

export function MazeThread({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const spiral = useMemo(() => buildSpiral(), []);

  const maskId = `maze-mask-${uid}`;
  const fadeId = `maze-fade-${uid}`;
  const glowId = `thread-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={fadeId} cx="50%" cy="50%" r="58%">
          <stop offset="58%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={maskId}>
          <rect x="0" y="0" width="600" height="600" fill={`url(#${fadeId})`} />
        </mask>
        <filter
          id={glowId}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Ring walls — each with an opening, slowly counter-rotating */}
        {RINGS.map((ring) => {
          const c = 2 * Math.PI * ring.r;
          const visible = c * (1 - ring.gap);
          return (
            <circle
              key={ring.r}
              cx={CENTER}
              cy={CENTER}
              r={ring.r}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
              strokeDasharray={`${visible} ${c - visible}`}
              strokeDashoffset={-c * ring.phase}
              className={ring.ccw ? "ring-ccw" : "ring-cw"}
              style={{ animationDuration: `${ring.dur}s` }}
            />
          );
        })}

        {/* The golden thread: luminous bed, then the marching spiral */}
        <path d={spiral} stroke="var(--primary)" strokeWidth="9" opacity="0.08" />
        <path
          d={spiral}
          className="thread-dash"
          stroke="var(--primary)"
          strokeWidth="2.25"
          opacity="0.9"
          filter={`url(#${glowId})`}
        />

        {/* The heart: the validated answer */}
        <circle cx={CENTER} cy={CENTER} r="7" fill="var(--primary)" filter={`url(#${glowId})`} />

        {/* Beads travelling the thread */}
        {!reduce && (
          <>
            <circle cx={CENTER} cy={CENTER} r="16" fill="var(--primary)">
              <animate
                attributeName="opacity"
                values="0.35;0.08;0.35"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="5" fill="var(--primary)" filter={`url(#${glowId})`}>
              <animateMotion dur="14s" repeatCount="indefinite" path={spiral} />
            </circle>
            <circle r="3.25" fill="var(--primary)" opacity="0.65">
              <animateMotion
                dur="14s"
                begin="-6.5s"
                repeatCount="indefinite"
                path={spiral}
              />
            </circle>
          </>
        )}
      </g>
    </svg>
  );
}
