import assert from "node:assert/strict";
import test from "node:test";
import { createQueryRoutes, pointOnRoute } from "../src/lib/site-scene.ts";

test("packet movement follows corners at a constant distance per second", () => {
  const route = {
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
    ],
    length: 30,
    depth: 1,
    phase: 0,
  };
  assert.deepEqual(pointOnRoute(route, 5), { x: 5, y: 0 });
  assert.deepEqual(pointOnRoute(route, 10), { x: 10, y: 0 });
  assert.deepEqual(pointOnRoute(route, 15), { x: 10, y: 5 });
  assert.deepEqual(pointOnRoute(route, 35), pointOnRoute(route, 5));
  assert.deepEqual(pointOnRoute(route, -5), pointOnRoute(route, 25));
});

test("resize back to the same dimensions restores the same scene", () => {
  const original = createQueryRoutes(1920, 900);
  createQueryRoutes(375, 1400);
  assert.deepEqual(createQueryRoutes(1920, 900), original);
});

test("mobile and 4K scenes remain bounded and span the available width", () => {
  for (const [width, height, limit] of [
    [375, 1400, 12],
    [768, 1200, 48],
    [3840, 1200, 48],
  ]) {
    const routes = createQueryRoutes(width, height);
    assert.ok(routes.length <= limit);
    assert.ok(routes.some((route) => route.points[0].x < width * 0.1));
    assert.ok(routes.some((route) => route.points[0].x > width * 0.9));
    for (const route of routes) {
      assert.ok(route.length > 0);
      for (const distance of [0, route.length, 1e9]) {
        const p = pointOnRoute(route, distance);
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
      }
    }
  }
});
