"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

type Stat = {
  value: number;
  decimals?: number;
  unit: string;
  suffix?: string;
  label: string;
};

const stats: Stat[] = [
  { value: 6.8, decimals: 1, unit: " MB", label: "Single binary" },
  { value: 22, unit: "M/s", label: "Cache reads" },
  { value: 45, unit: " ns", label: "Cache get" },
  { value: 1.4, decimals: 1, unit: " µs", label: "Cached resolve" },
  { value: 256, unit: "", label: "Cache shards" },
  { value: 40, unit: "", suffix: "+", label: "RFCs implemented" },
];

function StatCell({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(stat.value);
  const text = useTransform(value, (v) => v.toFixed(stat.decimals ?? 0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      value.set(stat.value);
      return;
    }
    value.set(0);
    const controls = animate(value, stat.value, {
      duration: 1.4,
      ease: [0.2, 0, 0, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, value, stat.value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-start gap-2 border-border/60 px-5 py-7 sm:py-9"
    >
      <div className="font-sans text-3xl font-medium tracking-[-0.06em] tabular-nums sm:text-4xl">
        <span className="sr-only">{stat.value.toFixed(stat.decimals ?? 0)}</span>
        <motion.span aria-hidden="true">{text}</motion.span>
        <span className="text-primary">{stat.unit}</span>
        {stat.suffix ? (
          <span className="text-primary">{stat.suffix}</span>
        ) : null}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
        {stat.label}
      </p>
    </div>
  );
}

export function StatsStrip() {
  return (
    <section
      aria-label="Key numbers"
      className="border-y border-border bg-surface/40"
    >
      <div className="site-container">
        <div className="grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <StatCell key={stat.label} stat={stat} />
          ))}
        </div>
        <p className="border-t border-border/60 py-3 text-center font-mono text-xs text-muted">
          Benchmarked on AMD Ryzen 9 9950X3D · labyrinth-bench · single thread
        </p>
      </div>
    </section>
  );
}
