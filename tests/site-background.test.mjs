import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as scene from "../src/lib/site-scene.ts";

// Run the actual effect against a deterministic SVG/event boundary. Assertions
// observe SVG output, scheduled frames and listener cleanup, not private state.
function mount({ reduced = false, width = 1440, height = 900 } = {}) {
  const effects = [],
    refs = [],
    cleanups = [],
    observers = [],
    frames = new Map();
  let now = 0,
    sequence = 0,
    writes = 0;
  const target = (extra = {}) => {
    const listeners = new Map();
    return {
      ...extra,
      listeners,
      addEventListener(name, fn) {
        listeners.set(name, fn);
      },
      removeEventListener(name) {
        listeners.delete(name);
      },
      fire(name, event) {
        listeners.get(name)?.(event);
      },
    };
  };
  class Element {
    constructor(control = false) {
      this.control = control;
    }
    closest() {
      return this.control ? this : null;
    }
  }
  class SvgNode extends Element {
    constructor(tag) {
      super();
      this.tag = tag;
      this.children = [];
      this.attrs = {};
      this.clientWidth = width;
      this.clientHeight = height;
    }
    setAttribute(name, value) {
      this.attrs[name] = String(value);
      writes++;
    }
    append(...nodes) {
      this.children.push(...nodes);
    }
    replaceChildren(...nodes) {
      this.children = nodes.flatMap((n) =>
        n.tag === "fragment" ? n.children : [n],
      );
    }
  }
  const root = target();
  const document = target({
    hidden: false,
    documentElement: root,
    querySelectorAll: () => [],
    createElementNS: (_ns, tag) => new SvgNode(tag),
    createDocumentFragment: () => new SvgNode("fragment"),
  });
  const window = target({ scrollY: 0, getSelection: () => "" });
  const media = target({ matches: reduced });
  const makeObserver = (kind) =>
    class {
      constructor(callback) {
        this.callback = callback;
        this.kind = kind;
        observers.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    };
  const exports = {};
  const output = ts.transpileModule(
    readFileSync(
      new URL("../src/components/site-background.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(output, {
    exports,
    require(name) {
      if (name === "react")
        return {
          useEffect: (fn) => effects.push(fn),
          useRef: (initial) => {
            const ref = { current: initial };
            refs.push(ref);
            return ref;
          },
          useState: (value) => [value, () => {}],
        };
      if (name === "react/jsx-runtime")
        return { jsx: (_type, props) => props, jsxs: (_type, props) => props };
      if (name === "lucide-react")
        return { Pause: () => null, Play: () => null };
      if (name === "next/navigation") return { usePathname: () => "/" };
      if (name === "@/lib/site-scene") return scene;
      throw new Error(`Unexpected import: ${name}`);
    },
    document,
    window,
    Element,
    matchMedia: () => media,
    performance: { now: () => now },
    requestAnimationFrame: (fn) => {
      const id = ++sequence;
      frames.set(id, fn);
      return id;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: makeObserver("resize"),
    IntersectionObserver: makeObserver("intersection"),
  });
  exports.SiteBackground();
  const svg = new SvgNode("svg");
  refs[0].current = svg;
  effects.forEach((effect) => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  });
  const visible = (value) =>
    observers
      .find((o) => o.kind === "intersection")
      .callback([{ isIntersecting: value }]);
  const advance = (milliseconds) => {
    for (let elapsed = 0; elapsed < milliseconds; elapsed += 20) {
      now += 20;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((fn) => fn(now));
    }
  };
  const pointer = (
    type,
    x = 700,
    y = 200,
    control = false,
    pointerType = "mouse",
  ) =>
    document.fire(type, {
      clientX: x,
      clientY: y,
      target: new Element(control),
      isPrimary: true,
      button: 0,
      pointerId: 1,
      pointerType,
    });
  const signalCount = () =>
    svg.children.filter((el) => el.attrs.visibility === "visible").length;
  visible(true);
  advance(100);
  return {
    svg,
    frames,
    document,
    window,
    root,
    media,
    observers,
    visible,
    advance,
    pointer,
    signalCount,
    get writes() {
      return writes;
    },
    pause() {
      refs[2].current = false;
      refs[1].current();
    },
    unmount() {
      cleanups.forEach((fn) => fn());
    },
  };
}

test("SVG animation stops offscreen, in a hidden tab and on pause; all resources clean up", () => {
  const env = mount();
  assert.ok(env.writes > 0);
  env.visible(false);
  let writes = env.writes;
  env.advance(10000);
  assert.equal(env.writes, writes);
  assert.equal(env.frames.size, 0);
  env.visible(true);
  env.advance(100);
  assert.ok(env.writes > writes);
  env.document.hidden = true;
  env.document.fire("visibilitychange");
  writes = env.writes;
  env.advance(10000);
  assert.equal(env.writes, writes);
  assert.equal(env.frames.size, 0);
  env.document.hidden = false;
  env.document.fire("visibilitychange");
  env.advance(100);
  env.pause();
  writes = env.writes;
  env.advance(10000);
  assert.equal(env.writes, writes);
  assert.equal(env.frames.size, 0);
  env.unmount();
  for (const target of [env.root, env.document, env.window, env.media])
    assert.equal(target.listeners.size, 0);
  assert.ok(env.observers.every((o) => o.disconnected));
  assert.equal(env.svg.children.length, 0);
});

test("reduced motion is static during taps and scrolls, and updates when the preference changes", () => {
  const env = mount({ reduced: true });
  const firstTransform = env.svg.children[0].attrs.transform;
  const writes = env.writes;
  env.pointer("pointerdown");
  env.pointer("pointerup");
  env.advance(2000);
  assert.equal(env.writes, writes);
  assert.equal(env.signalCount(), 0);
  env.window.scrollY = 4000;
  env.window.fire("scroll");
  assert.equal(env.svg.children[0].attrs.transform, firstTransform);
  assert.equal(env.frames.size, 0);
  env.media.matches = false;
  env.media.fire("change");
  env.advance(100);
  assert.equal(env.frames.size, 1);
  env.media.matches = true;
  env.media.fire("change");
  assert.equal(env.frames.size, 0);
  env.unmount();
});

test("controls, selection drags, scroll gestures and cancelled touches never emit signals", () => {
  const env = mount();
  env.pointer("pointerdown", 700, 200, true);
  env.pointer("pointerup", 700, 200, true);
  env.advance(100);
  assert.equal(env.signalCount(), 0);
  env.pointer("pointerdown");
  env.pointer("pointerup", 740);
  env.advance(100);
  assert.equal(env.signalCount(), 0);
  for (const cancellation of ["pointercancel", "scroll"]) {
    env.pointer("pointerdown", 700, 200, false, "touch");
    if (cancellation === "scroll") env.window.fire("scroll");
    else env.pointer("pointercancel");
    env.pointer("pointerup", 700, 200, false, "touch");
    env.advance(100);
    assert.equal(env.signalCount(), 0);
  }
  env.unmount();
});

test("repeated taps reuse bounded SVG nodes, produce sparks, and expire", () => {
  const env = mount();
  const childCount = env.svg.children.length;
  for (let i = 0; i < 30; i++) {
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.advance(100);
    assert.ok(
      env.signalCount() > 0 && env.signalCount() <= scene.siteScene.maxPulses,
    );
    assert.equal(env.svg.children.length, childCount);
  }
  const signal = env.svg.children.find(
    (el) => el.attrs.visibility === "visible",
  );
  assert.ok(
    signal.children.some(
      (el) => el.attrs.class === "scene-spark" && el.attrs.d,
    ),
  );
  env.advance(2500);
  assert.equal(env.signalCount(), 0);
  env.unmount();
});

test("mobile reduces SVG object count; pointer response stays local and fades on leave", () => {
  const mobile = mount({ width: 375, height: 800 });
  const desktop = mount({ width: 3840, height: 1080 });
  assert.ok(mobile.svg.children.length < desktop.svg.children.length);
  const route = desktop.svg.children.find((el) => !el.attrs.visibility);
  const packet = route.children.find((el) => el.attrs.class === "scene-packet");
  const x = Number(packet.attrs.cx),
    y = Number(packet.attrs.cy);
  desktop.pointer("pointermove", x, y, false, "touch");
  desktop.advance(100);
  assert.ok(
    desktop.svg.children
      .filter((el) => !el.attrs.visibility)
      .every((el) => Number(el.children[3].attrs.opacity) === 0),
  );
  desktop.pointer("pointermove", x, y);
  desktop.advance(100);
  const connected = desktop.svg.children.filter(
    (el) => !el.attrs.visibility && Number(el.children[3].attrs.opacity) > 0,
  );
  assert.ok(
    connected.length > 0 && connected.length < desktop.svg.children.length / 2,
  );
  desktop.root.fire("pointerleave");
  desktop.advance(2500);
  assert.ok(
    desktop.svg.children
      .filter((el) => !el.attrs.visibility)
      .every((el) => Number(el.children[3].attrs.opacity) < 0.001),
  );
  mobile.unmount();
  desktop.unmount();
});
