// Limits are shared by the scene lifecycle and drawing code. Units: CSS px / seconds.
export const siteScene = {
  seed: 731,
  areaPerRoute: 42000,
  routes: { mobile: 12, desktop: 48 },
  pointerRadius: 260,
  pointerForce: 34,
  speed: 18,
  idleAfter: 5,
  idleIntensity: 0.42,
  pulseLife: 1.65,
  pulseRadius: 290,
  maxPulses: 5,
  trailLife: 0.65,
  maxTrails: 16,
  tapDistance: 9,
  tapDuration: 0.65,
  fps: { mobile: 24, idle: 30, active: 60 },
} as const;

export type Point = { x: number; y: number };
export type QueryRoute = {
  points: Point[];
  length: number;
  phase: number;
  depth: number;
};

export function createQueryRoutes(width: number, height: number): QueryRoute[] {
  let seed: number = siteScene.seed;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const mobile = width < 768;
  const count = Math.min(
    mobile ? siteScene.routes.mobile : siteScene.routes.desktop,
    Math.max(10, Math.round((width * height) / siteScene.areaPerRoute)),
  );
  return Array.from({ length: count }, (_, index) => {
    // Distribute by strata rather than clustering random particles in a corner.
    const x = ((index + random() * 0.7) / count) * width;
    const y = random() * height;
    const unit = mobile ? 30 : 44;
    const points: Point[] = [{ x, y }];
    for (let turn = 0; turn < 5; turn++) {
      const previous = points[points.length - 1];
      const distance =
        unit * (1 + Math.floor(random() * 3)) * (random() > 0.5 ? 1 : -1);
      points.push({
        x: previous.x + (turn % 2 ? distance : 0),
        y: previous.y + (turn % 2 ? 0 : distance),
      });
    }
    const length = points
      .slice(1)
      .reduce(
        (sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y),
        0,
      );
    return { points, length, phase: random(), depth: 0.35 + random() * 0.65 };
  });
}

export function pointOnRoute(route: QueryRoute, distance: number): Point {
  let remaining = ((distance % route.length) + route.length) % route.length;
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1],
      b = route.points[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= length) {
      const t = remaining / length;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= length;
  }
  return route.points[0];
}
