import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as scene from "../src/lib/site-scene.ts";

// Run the actual effect against a deterministic SVG/event boundary. Assertions
// observe SVG output, scheduled frames and listener cleanup, not private state.
function mount({
  reduced = false,
  width = 1440,
  height = 900,
  quiet = [],
} = {}) {
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
    querySelectorAll: () =>
      quiet.map((rect) => ({ getBoundingClientRect: () => rect })),
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
  const overlay = refs[3] ? new SvgNode("svg") : null;
  if (overlay) refs[3].current = overlay;
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
    (overlay || svg).children.filter((el) => el.attrs.visibility === "visible")
      .length;
  const connections = () => {
    const walk = (node) => [node, ...node.children.flatMap(walk)];
    return walk(overlay || svg).filter(
      (el) => el.attrs.class === "scene-connection",
    );
  };
  visible(true);
  advance(100);
  return {
    svg,
    overlay,
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
    connections,
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
  assert.equal(env.overlay?.children.length ?? 0, 0);
});

test("hover stays active over controls and while scrolling at a stationary pointer", () => {
  const env = mount();
  const route = env.svg.children.find((el) => !el.attrs.visibility);
  const packet = route.children.find((el) => el.attrs.class === "scene-packet");
  const x = Number(packet.attrs.cx),
    y = Number(packet.attrs.cy);
  const connections = () => {
    const walk = (node) => [node, ...node.children.flatMap(walk)];
    return walk(env.overlay || env.svg).filter(
      (el) => el.attrs.class === "scene-connection",
    );
  };
  env.pointer("pointermove", x, y, true);
  env.advance(300);
  assert.ok(
    connections().some((el) => Number(el.attrs.opacity) > 0.01),
    "control hover must keep tracking",
  );
  env.window.scrollY = 600;
  env.window.fire("scroll");
  env.advance(800);
  assert.ok(
    connections().some((el) => Number(el.attrs.opacity) > 0.01),
    "scroll must preserve viewport pointer",
  );
  const cursor = env.overlay.children.find(
    (el) => el.attrs.class === "scene-cursor",
  );
  assert.equal(cursor.attrs.transform, `translate(${x} ${y})`);
  env.pointer("pointerdown", 620, 410);
  env.pointer("pointerup", 620, 410);
  env.advance(100);
  assert.equal(
    env.overlay.children.find((el) => el.attrs.visibility === "visible").attrs
      .transform,
    "translate(620 410)",
  );
  env.unmount();
});

test("text region boundaries never abruptly suppress a whole route", () => {
  const outside = mount();
  const inside = mount({
    quiet: [{ left: -10000, right: 10000, top: -10000, bottom: 10000 }],
  });
  assert.equal(
    inside.svg.children[0].attrs.opacity,
    outside.svg.children[0].attrs.opacity,
  );
  outside.unmount();
  inside.unmount();
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
  const childCount =
    env.svg.children.length + (env.overlay?.children.length ?? 0);
  for (let i = 0; i < 30; i++) {
    env.pointer("pointerdown");
    env.pointer("pointerup");
    env.advance(100);
    assert.ok(
      env.signalCount() > 0 && env.signalCount() <= scene.siteScene.maxPulses,
    );
    assert.equal(
      env.svg.children.length + (env.overlay?.children.length ?? 0),
      childCount,
    );
  }
  const signal = (env.overlay || env.svg).children.find(
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
    desktop.connections().every((el) => Number(el.attrs.opacity) === 0),
  );
  desktop.pointer("pointermove", x, y);
  desktop.advance(100);
  const connected = desktop
    .connections()
    .filter((el) => Number(el.attrs.opacity) > 0);
  assert.ok(
    connected.length > 0 && connected.length < desktop.svg.children.length / 2,
  );
  desktop.root.fire("pointerleave");
  desktop.advance(2500);
  assert.ok(
    desktop.connections().every((el) => Number(el.attrs.opacity) < 0.001),
  );
  mobile.unmount();
  desktop.unmount();
});

test("click shock displaces nearby objects while distant routes keep their calm motion", () => {
  const control = mount();
  const active = mount();
  const routes = scene.createQueryRoutes(1440, 900);
  const center = scene.pointOnRoute(routes[5], routes[5].length * 0.5);
  // Match active frame cadence without applying a local force in the control.
  control.pointer("pointermove", -10000, -10000);
  active.pointer("pointerdown", center.x + 50, center.y);
  active.pointer("pointerup", center.x + 50, center.y);
  control.advance(300);
  active.advance(300);
  assert.notEqual(
    active.svg.children[5].attrs.transform,
    control.svg.children[5].attrs.transform,
  );
  assert.equal(
    active.svg.children.at(-1).attrs.transform,
    control.svg.children.at(-1).attrs.transform,
  );
  control.unmount();
  active.unmount();
});
