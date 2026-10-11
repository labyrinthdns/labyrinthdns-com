"use client";

import { useReducedMotion } from "motion/react";

// Seeded passages and a real route, identical during server and client rendering.
function createMaze() {
  const size = 19;
  const cells = Array.from({ length: size * size }, () => [
    true,
    true,
    true,
    true,
  ]);
  const visited = new Set<number>([0]);
  const parents = new Map<number, number>();
  const stack = [0];
  let seed = 73;
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  while (stack.length) {
    const current = stack[stack.length - 1];
    const x = current % size,
      y = Math.floor(current / size);
    const neighbors = directions.flatMap(([dx, dy], direction) => {
      const nx = x + dx,
        ny = y + dy,
        next = ny * size + nx;
      return nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(next)
        ? [{ next, direction }]
        : [];
    });
    if (!neighbors.length) {
      stack.pop();
      continue;
    }
    seed = (seed * 16807) % 2147483647;
    const { next, direction } = neighbors[seed % neighbors.length];
    cells[current][direction] = false;
    cells[next][(direction + 2) % 4] = false;
    parents.set(next, current);
    visited.add(next);
    stack.push(next);
  }
  const unit = 24,
    offset = 32;
  let walls = "";
  cells.forEach((cell, index) => {
    const x = offset + (index % size) * unit,
      y = offset + Math.floor(index / size) * unit;
    if (cell[0]) walls += `M${x},${y}h${unit}`;
    if (cell[3]) walls += `M${x},${y}v${unit}`;
    if (index % size === size - 1 && cell[1])
      walls += `M${x + unit},${y}v${unit}`;
    if (Math.floor(index / size) === size - 1 && cell[2])
      walls += `M${x},${y + unit}h${unit}`;
  });
  const route = [size * size - 1];
  while (route[route.length - 1] !== 0)
    route.push(parents.get(route[route.length - 1])!);
  route.reverse();
  const points = route.map(
    (index) =>
      `${offset + (index % size) * unit + unit / 2},${offset + Math.floor(index / size) * unit + unit / 2}`,
  );
  return {
    walls,
    route: `M${points.join("L")}`,
    lost: `M${points.slice(0, Math.floor(points.length * 0.62)).join("L")}`,
  };
}
const maze = createMaze();

export function MazeMap({
  running = true,
  lost = false,
}: {
  running?: boolean;
  lost?: boolean;
}) {
  const reduce = useReducedMotion();
  const path = lost ? maze.lost : maze.route;
  return (
    <svg
      className={`maze-map ${running ? "is-running" : "is-paused"}`}
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={maze.walls}
        stroke="currentColor"
        strokeWidth="1.5"
        className="maze-walls"
      />
      <path
        d={path}
        stroke="var(--maze-accent)"
        strokeWidth="7"
        opacity=".08"
        strokeLinejoin="round"
      />
      <path
        d={path}
        stroke="var(--maze-accent)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        pathLength="1"
        className="maze-route"
      />
      <circle cx="44" cy="44" r="4" fill="var(--maze-accent)" />
      {!lost && (
        <>
          <circle cx="476" cy="476" r="9" stroke="var(--maze-accent)" />
          <circle cx="476" cy="476" r="3" fill="var(--maze-accent)" />
        </>
      )}
      {!reduce && running && (
        <circle r="4" fill="var(--maze-accent)">
          <animateMotion
            dur={lost ? "9s" : "16s"}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </svg>
  );
}
