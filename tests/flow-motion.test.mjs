import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function edge(data) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/components/flow-parts.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "react") return { memo: (fn) => fn };
      if (name === "motion/react") return { useReducedMotion: () => false };
      if (name === "react/jsx-runtime") return { Fragment: "fragment", jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name === "@xyflow/react") return { getBezierPath: () => ["M0 0L100 100"], Position: {}, Handle: "handle" };
      if (name === "lucide-react") return {};
      if (name === "@/lib/utils") return { cn: (...parts) => parts.filter(Boolean).join(" ") };
      if (name === "@/components/maze-glyph") return {};
      throw new Error(name);
    },
  });
  const root = exports.ThreadEdge({ id: "query", sourceX: 0, sourceY: 0, targetX: 100, targetY: 100, data });
  const walk = (node) => !node || typeof node !== "object" ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(walk)];
  return walk(root);
}

test("paused or offscreen active edges retain the route but stop every moving decoration", () => {
  const nodes = edge({ state: "active", running: false });
  assert.ok(nodes.some((node) => node.type === "path"));
  assert.equal(nodes.filter((node) => node.type === "animateMotion").length, 0);
  assert.equal(nodes.filter((node) => node.props?.className === "thread-dash").length, 0);
});

test("running active edges animate while completed edges remain still", () => {
  assert.equal(edge({ state: "active", running: true }).filter((node) => node.type === "animateMotion").length, 1);
  assert.equal(edge({ state: "done", running: true }).filter((node) => node.type === "animateMotion").length, 0);
});
