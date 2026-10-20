import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual button handler against the browser clipboard boundary.
function mount(clipboard) {
  const state = [];
  let index = 0;
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/components/copy-command.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    navigator: { clipboard },
    require(name) {
      if (name === "react") return {
        useCallback: (fn) => fn,
        useEffect: () => {},
        useState(initial) {
          const slot = index++;
          if (state[slot] === undefined) state[slot] = initial;
          return [state[slot], (value) => { state[slot] = value; }];
        },
      };
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name === "radix-ui") return { Tooltip: Object.fromEntries(["Provider", "Root", "Trigger", "Portal", "Content", "Arrow"].map((key) => [key, key])) };
      if (name === "lucide-react") return { Check: "Check", Copy: "Copy", CircleAlert: "CircleAlert" };
      if (name === "@/lib/utils") return { cn: (...values) => values.filter(Boolean).join(" ") };
      throw new Error(name);
    },
  });
  return () => {
    index = 0;
    const root = exports.CopyButton({ text: "dig @127.0.0.1 example.com" });
    const walk = (node) => !node || typeof node !== "object" ? [] : [node, ...[node.props?.children].flat(Infinity).flatMap(walk)];
    const nodes = walk(root);
    return { button: nodes.find((node) => node.type === "button"), status: nodes.find((node) => node.props?.role === "status") };
  };
}

test("successful copy writes the complete command and announces success", async () => {
  const calls = [];
  const render = mount({ writeText: async (text) => calls.push(text) });
  await render().button.props.onClick();
  const view = render();
  assert.deepEqual(calls, ["dig @127.0.0.1 example.com"]);
  assert.equal(view.button.props["aria-label"], "Copied");
  assert.equal(view.status.props.children, "Copied");
});

for (const [name, clipboard] of [
  ["permission denied", { writeText: async () => { throw new Error("NotAllowedError"); } }],
  ["clipboard unavailable", undefined],
]) {
  test(`${name} provides an accessible manual-copy fallback`, async () => {
    const render = mount(clipboard);
    await render().button.props.onClick();
    const view = render();
    assert.match(view.button.props["aria-label"], /Copy failed.*copy it manually/);
    assert.equal(view.status.props.children, view.button.props["aria-label"]);
  });
}
