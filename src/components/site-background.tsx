"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  createQueryRoutes,
  pointOnRoute,
  siteScene as config,
  type Point,
  type QueryRoute,
} from "@/lib/site-scene";

const ns = "http://www.w3.org/2000/svg";
const controls =
  "a,button,input,select,textarea,summary,[role='button'],[role='slider'],[contenteditable],[data-background-control],.react-flow";
type RouteElements = {
  route: QueryRoute;
  group: SVGGElement;
  packet: SVGCircleElement;
  connection: SVGPathElement;
  highlight: SVGGElement;
  response: SVGPathElement;
  center: Point;
};
type Signal = Point & { born: number; variant: number };
type SignalElements = {
  group: SVGGElement;
  wave: SVGPathElement;
  sparks: SVGPathElement[];
};

export function SiteBackground() {
  const pathname = usePathname();
  const svgRef = useRef<SVGSVGElement>(null);
  const refreshRef = useRef<(() => void) | null>(null);
  const playback = useRef(true);
  const interactionRef = useRef<SVGSVGElement>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    playback.current = running;
    refreshRef.current?.();
  }, [running, pathname]);

  useEffect(() => {
    const svg = svgRef.current;
    const overlay = interactionRef.current;
    if (!svg || !overlay) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      clock = 0,
      previous = 0,
      frame = 0,
      lastInput = -10,
      revealed = 0;
    let visible = false,
      disposed = false,
      mobile = false;
    let scrollOffset = window.scrollY;
    let routes: RouteElements[] = [],
      signals: Signal[] = [],
      pool: SignalElements[] = [];
    let trails: (Point & { born: number })[] = [];
    let lastTrail = -1;
    let trailNodes: SVGCircleElement[] = [];
    let cursor: SVGGElement;
    let down: (Point & { id: number; time: number; blocked: boolean }) | null =
      null;
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    const make = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number> = {},
    ) => {
      const el = document.createElementNS(ns, name);
      Object.entries(attrs).forEach(([key, value]) =>
        el.setAttribute(key, String(value)),
      );
      return el;
    };
    const blocked = (event: PointerEvent) =>
      event.target instanceof Element && !!event.target.closest(controls);
    const render = () => {
      const calm = motion.matches || !playback.current;
      revealed = calm ? 1 : Math.max(revealed, Math.min(1, clock / 1.4));
      const entrance = revealed;
      const activity = Math.max(
        config.idleIntensity,
        1 - Math.max(0, clock - lastInput - config.idleAfter) * 0.15,
      );
      for (const item of routes) {
        const {
          route,
          center,
          group,
          packet,
          connection,
          highlight,
          response,
        } = item;
        const parallax = calm
          ? 0
          : Math.sin(scrollOffset * 0.0015 + route.phase * 4) *
            28 *
            route.depth;
        const driftX = calm
          ? 0
          : Math.sin(clock * 0.17 + route.phase * 8) * 7 * route.depth;
        const driftY = calm
          ? 0
          : Math.cos(clock * 0.13 + route.phase * 8) * 5 * route.depth;
        const dx = center.x - pointer.x,
          dy = center.y + parallax - pointer.y;
        const distance = Math.hypot(dx, dy);
        let force =
          Math.max(0, 1 - distance / config.pointerRadius) ** 2 *
          pointer.strength *
          config.pointerForce;
        let shockX = 0,
          shockY = 0,
          energy = 0;
        for (const signal of signals) {
          const age = (clock - signal.born) / config.pulseLife;
          const sx = center.x - signal.x,
            sy = center.y + parallax - signal.y;
          const sd = Math.hypot(sx, sy);
          const reach = Math.max(0, 1 - sd / (config.pulseRadius + 60));
          const ring =
            Math.exp(-Math.pow((sd - age * config.pulseRadius) / 65, 2)) *
            (1 - age) *
            reach;
          shockX += (sx / (sd || 1)) * ring * 42;
          shockY += (sy / (sd || 1)) * ring * 42;
          energy = Math.min(1, energy + ring * 2);
        }
        force *= 0.8 + Math.sin(clock * 2 + route.phase * 6) * 0.2;
        const x = driftX + (dx / (distance || 1)) * force + shockX,
          y = parallax + driftY + (dy / (distance || 1)) * force + shockY;
        const transform = `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
        group.setAttribute("transform", transform);
        group.setAttribute(
          "opacity",
          String((0.45 + route.depth * 0.5) * entrance),
        );
        const travel =
          (route.phase * route.length +
            clock * config.speed * (0.5 + route.depth * 0.5)) %
          route.length;
        const p = pointOnRoute(route, travel);
        const fade = Math.min(1, travel / 22, (route.length - travel) / 22);
        packet.setAttribute("cx", String(p.x));
        packet.setAttribute("cy", String(p.y));
        packet.setAttribute("opacity", String(fade * (0.35 + activity * 0.6)));
        const proximity = Math.max(
          0,
          1 -
            Math.hypot(p.x + x - pointer.x, p.y + y - pointer.y) /
              config.pointerRadius,
        );
        connection.setAttribute(
          "opacity",
          String(proximity ** 2 * pointer.strength * 0.75),
        );
        if (proximity > 0 && pointer.strength > 0.01)
          connection.setAttribute(
            "d",
            `M${p.x} ${p.y}H${pointer.x - x}V${pointer.y - y}`,
          );
        highlight.setAttribute("transform", transform);
        highlight.setAttribute(
          "opacity",
          String(
            Math.min(
              0.65,
              proximity ** 2 * pointer.strength * 0.65 + energy * 0.6,
            ),
          ),
        );
        response.setAttribute(
          "d",
          `M${[-28, -14, 0, 14, 28]
            .map((offset) => {
              const q = pointOnRoute(
                route,
                Math.max(0, Math.min(route.length - 0.001, travel + offset)),
              );
              return `${q.x} ${q.y}`;
            })
            .join("L")}`,
        );
      }
      cursor.setAttribute("transform", `translate(${pointer.x} ${pointer.y})`);
      cursor.setAttribute("opacity", String(pointer.strength * 0.24));
      trailNodes.forEach((node, i) => {
        const trail = trails[i];
        if (!trail) {
          node.setAttribute("opacity", "0");
          return;
        }
        const age = (clock - trail.born) / config.trailLife;
        node.setAttribute("cx", String(trail.x));
        node.setAttribute("cy", String(trail.y));
        node.setAttribute("r", String(3 + age * 14));
        node.setAttribute("opacity", String((1 - age) ** 2 * 0.28));
      });
      pool.forEach((item, index) => {
        const signal = signals[index];
        if (!signal) {
          item.group.setAttribute("visibility", "hidden");
          return;
        }
        const age = (clock - signal.born) / config.pulseLife;
        const radius = (1 - (1 - age) ** 3) * config.pulseRadius;
        item.group.setAttribute("visibility", "visible");
        item.group.setAttribute(
          "transform",
          `translate(${signal.x} ${signal.y})`,
        );
        item.group.setAttribute("opacity", String((1 - age) ** 2 * 0.7));
        let path = `M${radius} 0A${radius} ${radius} 0 1 0 ${-radius} 0A${radius} ${radius} 0 1 0 ${radius} 0`;
        if (signal.variant === 1)
          path = `M0 ${-radius}L${radius} 0 0 ${radius} ${-radius} 0Z`;
        if (signal.variant === 2) {
          const cut = radius * 0.35;
          path = `M${-cut} ${-radius}H${cut}L${radius} ${-cut}V${cut}L${cut} ${radius}H${-cut}L${-radius} ${cut}V${-cut}Z`;
        }
        item.wave.setAttribute("d", path);
        item.sparks.forEach((spark, i) => {
          const angle =
            (i / item.sparks.length + signal.variant * 0.08) * Math.PI * 2;
          const spread = radius * (0.35 + (i % 3) * 0.12);
          const length = (1 - age) * 9;
          spark.setAttribute(
            "d",
            `M${Math.cos(angle) * spread} ${Math.sin(angle) * spread}l${Math.cos(angle) * length} ${Math.sin(angle) * length}`,
          );
        });
      });
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
      const fps = mobile
        ? config.fps.mobile
        : clock - lastInput > config.idleAfter
          ? config.fps.idle
          : config.fps.active;
      if (!previous || now - previous >= 1000 / fps - 1) {
        const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
        previous = now;
        clock += dt;
        pointer.strength +=
          (pointer.target - pointer.strength) * (1 - Math.exp(-dt * 6));
        signals = signals.filter((p) => clock - p.born < config.pulseLife);
        trails = trails.filter((p) => clock - p.born < config.trailLife);
        render();
      }
      frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (disposed || !visible || document.hidden) return;
      if (motion.matches || !playback.current) {
        signals = [];
        trails = [];
        pointer.strength = 0;
        render();
      } else frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      width = svg.clientWidth;
      height = svg.clientHeight;
      mobile = width < 768;
      if (!width || !height) return;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const fragment = document.createDocumentFragment();
      const foreground = document.createDocumentFragment();
      routes = createQueryRoutes(width, height).map((route) => {
        const group = make("g");
        const path = make("path", {
          class: "scene-route",
          d: `M${route.points.map((p) => `${p.x} ${p.y}`).join("L")}`,
        });
        const center = pointOnRoute(route, route.length * 0.5);
        const packet = make("circle", {
          class: "scene-packet",
          r: 1.5 + route.depth,
        });
        const connection = make("path", {
          class: "scene-connection",
          opacity: 0,
        });
        const size = 5 + route.depth * 7;
        const mark = make("path", {
          class: "scene-mark",
          d:
            route.phase < 0.5
              ? `M${center.x - size} ${center.y - size}h${size * 2}v${size * 2}h${-size * 2}Z`
              : `M${center.x - size} ${center.y}h${size}v${-size}m0 ${size}h${size}v${size}`,
        });
        group.append(path, mark, packet);
        fragment.append(group);
        const highlight = make("g");
        const response = make("path", { class: "scene-response" });
        highlight.append(response, connection);
        foreground.append(highlight);
        return {
          route,
          center,
          group,
          packet,
          connection,
          highlight,
          response,
        };
      });
      pool = Array.from({ length: config.maxPulses }, () => {
        const group = make("g", { visibility: "hidden" });
        const wave = make("path", { class: "scene-wave" });
        const sparks = Array.from({ length: mobile ? 4 : 7 }, () =>
          make("path", { class: "scene-spark" }),
        );
        group.append(wave, ...sparks);
        foreground.append(group);
        return { group, wave, sparks };
      });
      svg.replaceChildren(fragment);
      trailNodes = Array.from({ length: config.maxTrails }, () =>
        make("circle", { class: "scene-trail", opacity: 0 }),
      );
      cursor = make("g", { class: "scene-cursor", opacity: 0 });
      cursor.append(
        make("circle", { r: 38 }),
        make("path", { d: "M-48 0h13M35 0h13M0-48v13M0 35v13" }),
      );
      foreground.append(...trailNodes, cursor);
      overlay.replaceChildren(foreground);
      signals = [];
      trails = [];
      scrollOffset = window.scrollY;
      refresh();
    };
    const move = (event: PointerEvent) => {
      if (!allowed() || event.pointerType === "touch") {
        pointer.target = 0;
        return;
      }
      Object.assign(pointer, { x: event.clientX, y: event.clientY, target: 1 });
      lastInput = clock;
      if (
        clock - lastTrail > 0.035 &&
        Math.hypot(
          event.clientX - (trails.at(-1)?.x ?? -1000),
          event.clientY - (trails.at(-1)?.y ?? -1000),
        ) > 7
      ) {
        trails.push({ x: event.clientX, y: event.clientY, born: clock });
        trails = trails.slice(-config.maxTrails);
        lastTrail = clock;
      }
    };
    const press = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      down = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
        time: performance.now(),
        blocked: blocked(event),
      };
    };
    const release = (event: PointerEvent) => {
      const start = down;
      down = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        start.blocked ||
        blocked(event) ||
        !allowed()
      )
        return;
      if (
        Math.hypot(event.clientX - start.x, event.clientY - start.y) >
          config.tapDistance ||
        performance.now() - start.time > config.tapDuration * 1000 ||
        window.getSelection()?.toString()
      )
        return;
      const last = signals[signals.length - 1];
      if (last && clock - last.born < 0.09) return;
      signals.push({
        x: event.clientX,
        y: event.clientY,
        born: clock,
        variant:
          Math.floor(
            event.clientX / 120 + event.clientY / 120 + signals.length,
          ) % 3,
      });
      signals = signals.slice(-config.maxPulses);
      lastInput = clock;
    };
    const leave = () => {
      pointer.target = 0;
      down = null;
    };
    const scroll = () => {
      scrollOffset = window.scrollY;
      down = null;
      if (motion.matches || !playback.current) refresh();
    };
    const visibility = () => {
      leave();
      scrollOffset = window.scrollY;
      refresh();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      refresh();
    });
    intersection.observe(svg);
    document.addEventListener("pointermove", move, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointerdown", press, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointerup", release, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointercancel", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    motion.addEventListener("change", refresh);
    // Keep viewport coordinates and scroll parallax current across navigation.
    refreshRef.current = () => {
      scrollOffset = window.scrollY;
      refresh();
    };
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      refreshRef.current = null;
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", scroll);
      motion.removeEventListener("change", refresh);
      svg.replaceChildren();
      overlay.replaceChildren();
    };
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className="site-background"
        aria-hidden="true"
        focusable="false"
      />
      <svg
        ref={interactionRef}
        className="site-interactions"
        aria-hidden="true"
        focusable="false"
      />
      <button
        type="button"
        className="background-toggle"
        aria-label={
          running ? "Pause background animation" : "Play background animation"
        }
        aria-pressed={!running}
        onClick={() => setRunning((value) => !value)}
      >
        {running ? (
          <Pause size={13} aria-hidden="true" />
        ) : (
          <Play size={13} aria-hidden="true" />
        )}
        <span>Background</span>
      </button>
    </>
  );
}
