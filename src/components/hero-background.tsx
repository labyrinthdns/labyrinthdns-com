"use client";

import { useEffect, useRef } from "react";
import {
  createQueryRoutes,
  heroScene as config,
  pointOnRoute,
  type Point,
} from "@/lib/hero-scene";

type Signal = Point & { born: number; variant: number };
type QuietArea = { left: number; top: number; right: number; bottom: number };
const controls =
  "a, button, input, select, textarea, summary, [role='button'], [data-hero-control]";

/** Decorative canvas; input is observed on its parent without consuming events. */
export function HeroBackground({ running = true }: { running?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playback = useRef(running);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    playback.current = running;
    refreshRef.current?.();
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !host || !ctx) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      clock = 0;
    let visible = false,
      disposed = false,
      mobile = false,
      lastInput = -10,
      lastTrail = -1;
    let routes = createQueryRoutes(1, 1);
    let quiet: QuietArea[] = [];
    let palette: typeof config.light | typeof config.dark = config.light;
    let pulses: Signal[] = [],
      trails: Signal[] = [];
    let down: (Point & { time: number; id: number; blocked: boolean }) | null =
      null;
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    const local = (event: PointerEvent): Point => {
      const bounds = host.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const isControl = (event: PointerEvent) =>
      event.target instanceof Element && !!event.target.closest(controls);
    const toneAt = (point: Point) =>
      quiet.some(
        (box) =>
          point.x > box.left - 24 &&
          point.x < box.right + 24 &&
          point.y > box.top - 20 &&
          point.y < box.bottom + 20,
      )
        ? 0.16
        : 1;
    const dot = (p: Point, radius: number, alpha: number, color: string) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };
    const bend = (point: Point, depth: number): Point => {
      const dx = point.x - pointer.x,
        dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence =
        Math.max(0, 1 - distance / config.pointerRadius) ** 2 *
        pointer.strength;
      const drift = motion.matches
        ? 0
        : Math.sin(clock * 0.22 + depth * 8) * 4 * depth;
      return {
        x:
          point.x +
          (dx / (distance || 1)) * influence * config.pointerForce * depth +
          drift,
        y:
          point.y +
          (dy / (distance || 1)) * influence * config.pointerForce * depth -
          drift * 0.5,
      };
    };
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const activity = motion.matches
        ? 0
        : Math.max(
            config.idleIntensity,
            1 - Math.max(0, clock - lastInput - config.idleAfter) * 0.18,
          );
      const entrance =
        motion.matches || !playback.current ? 1 : Math.min(1, clock / 1.4);
      for (const route of routes) {
        const points = route.points.map((p) => bend(p, route.depth));
        // Separate segments let the quiet copy region stay subdued across a long route.
        ctx.strokeStyle = palette.route;
        ctx.lineWidth = 0.65 + route.depth * 0.5;
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1],
            b = points[i];
          ctx.globalAlpha =
            palette.opacity *
            route.depth *
            entrance *
            Math.min(toneAt(a), toneAt(b));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const distance =
          route.phase * route.length +
          clock * config.speed * (0.5 + route.depth * 0.5);
        const p = bend(pointOnRoute(route, distance), route.depth);
        const edge = Math.max(
          0,
          Math.min(
            1,
            p.x / 50,
            (width - p.x) / 50,
            p.y / 40,
            (height - p.y) / 40,
          ),
        );
        let energy = 0;
        for (const signal of pulses) {
          const age = (clock - signal.born) / config.pulseLife;
          energy +=
            Math.max(
              0,
              1 -
                Math.abs(
                  Math.hypot(p.x - signal.x, p.y - signal.y) -
                    age * config.pulseRadius,
                ) /
                  35,
            ) *
            (1 - age);
        }
        const travel = distance % route.length;
        const routeFade = Math.min(
          1,
          travel / 24,
          (route.length - travel) / 24,
        );
        const alpha =
          (0.34 + activity * 0.3 + Math.min(energy, 0.3)) *
          route.depth *
          toneAt(p) *
          entrance *
          edge *
          routeFade;
        dot(p, 1.5 + route.depth, alpha, palette.query);
        if (!motion.matches) {
          for (let tail = 1; tail <= (mobile ? 2 : 4); tail++) {
            const t = bend(
              pointOnRoute(route, distance - tail * 5),
              route.depth,
            );
            dot(t, 1, alpha * (1 - tail / 5) * 0.45, palette.query);
          }
        }
        if (
          pointer.strength > 0.05 &&
          Math.hypot(p.x - pointer.x, p.y - pointer.y) <
            config.pointerRadius * 0.7
        ) {
          const distanceToPointer = Math.hypot(
            p.x - pointer.x,
            p.y - pointer.y,
          );
          ctx.globalAlpha =
            (1 - distanceToPointer / config.pointerRadius) *
            pointer.strength *
            0.18 *
            toneAt(p);
          ctx.strokeStyle = palette.query;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      for (const trail of trails) {
        const age = (clock - trail.born) / config.trailLife;
        dot(
          trail,
          1 + age * 3,
          (1 - age) ** 2 * 0.22 * toneAt(trail),
          palette.query,
        );
      }
      for (const signal of pulses) {
        const age = (clock - signal.born) / config.pulseLife;
        const radius = config.pulseRadius * (1 - (1 - age) ** 2);
        ctx.strokeStyle = signal.variant === 1 ? palette.route : palette.query;
        ctx.globalAlpha = (1 - age) ** 2 * 0.6 * toneAt(signal);
        ctx.lineWidth = 1.5 - age;
        ctx.beginPath();
        // Related signal geometries: a round wave, a diamond, a chamfered square.
        if (signal.variant === 0)
          ctx.arc(signal.x, signal.y, radius, 0, Math.PI * 2);
        else {
          const sides = signal.variant === 1 ? 4 : 8;
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = signal.x + Math.cos(angle) * radius,
              y = signal.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        dot(
          signal,
          2 + (1 - age) * 3,
          (1 - age) ** 2 * 0.65 * toneAt(signal),
          palette.query,
        );
      }
      ctx.globalAlpha = 1;
    };
    const allowed = () =>
      !disposed &&
      visible &&
      !document.hidden &&
      !motion.matches &&
      playback.current;
    const tick = (now: number) => {
      frame = 0;
      if (!allowed()) {
        previous = 0;
        return;
      }
      const interval =
        1000 / (mobile ? 24 : clock - lastInput > config.idleAfter ? 30 : 60);
      if (!previous || now - previous >= interval - 1) {
        const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
        previous = now;
        clock += dt;
        pointer.strength +=
          (pointer.target - pointer.strength) * (1 - Math.exp(-dt * 6));
        pulses = pulses.filter((p) => clock - p.born < config.pulseLife);
        trails = trails.filter((p) => clock - p.born < config.trailLife);
        render();
      }
      frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (!visible || document.hidden || disposed) return;
      if (motion.matches || !playback.current) {
        pulses = [];
        trails = [];
        pointer.strength = 0;
        render();
      } else frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      mobile = width < 768;
      const dpr = Math.min(
        devicePixelRatio || 1,
        mobile ? config.dpr.mobile : config.dpr.desktop,
        Math.sqrt(config.maxPixels / Math.max(1, width * height)),
      );
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      routes = createQueryRoutes(width, height);
      quiet = [
        ...host.querySelectorAll(".hero-copy, .hero-kicker, .hero-scroll"),
      ].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - bounds.left,
          right: r.right - bounds.left,
          top: r.top - bounds.top,
          bottom: r.bottom - bounds.top,
        };
      });
      refresh();
    };
    const move = (event: PointerEvent) => {
      if (!allowed() || event.pointerType === "touch" || isControl(event)) {
        pointer.target = 0;
        return;
      }
      const p = local(event);
      Object.assign(pointer, p, { target: 1 });
      lastInput = clock;
      if (clock - lastTrail > 0.045) {
        trails.push({ ...p, born: clock, variant: 0 });
        trails = trails.slice(-config.maxTrails);
        lastTrail = clock;
      }
    };
    const press = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      down = {
        ...local(event),
        time: performance.now(),
        id: event.pointerId,
        blocked: isControl(event),
      };
    };
    const release = (event: PointerEvent) => {
      const start = down;
      down = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        start.blocked ||
        isControl(event) ||
        !allowed()
      )
        return;
      const p = local(event);
      if (
        Math.hypot(p.x - start.x, p.y - start.y) > config.tapDistance ||
        performance.now() - start.time > config.tapDuration * 1000 ||
        window.getSelection()?.toString()
      )
        return;
      const previousSignal = pulses[pulses.length - 1];
      if (previousSignal && clock - previousSignal.born < 0.09) return;
      const variant = Math.floor(p.x / 120 + p.y / 120 + pulses.length) % 3;
      pulses.push({ ...p, born: clock, variant });
      pulses = pulses.slice(-config.maxPulses);
      lastInput = clock;
    };
    const leave = () => {
      pointer.target = 0;
      down = null;
    };
    const colors = () => {
      palette = document.documentElement.classList.contains("dark")
        ? config.dark
        : config.light;
      refresh();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) leave();
      refresh();
    });
    intersection.observe(host);
    const theme = new MutationObserver(colors);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerdown", press, { passive: true });
    host.addEventListener("pointerup", release, { passive: true });
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointercancel", leave);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("resize", measure, { passive: true });
    motion.addEventListener("change", refresh);
    refreshRef.current = refresh;
    colors();
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      refreshRef.current = null;
      observer.disconnect();
      intersection.disconnect();
      theme.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", press);
      host.removeEventListener("pointerup", release);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", leave);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", refresh);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="hero-background" aria-hidden="true" />
  );
}
