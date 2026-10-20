"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className={className}
      data-reveal={seen && !reduce}
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${Math.min(y, 16)}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
