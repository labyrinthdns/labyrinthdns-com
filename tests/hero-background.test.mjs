import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as scene from "../src/lib/hero-scene.ts";

// Exercise the component effect with a deterministic browser boundary and clock.
// Canvas draw calls are the output; React state and scene internals stay private.
function mount({ reduced = false, width = 1440, height = 900 } = {}) {
  const effects = [],
    refs = [],
    cleanups = [],
    observers = [];
  let now = 0,
    sequence = 0,
    draws = 0,
    arcs = 0;
  const frames = new Map();
  function target(extra = {}) {
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
  }
  const media = target({ matches: reduced });
  const document = target({
    hidden: false,
    documentElement: { classList: { contains: () => false } },
  });
  const window = target({ getSelection: () => "" });
  const host = target({
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    querySelectorAll: () => [],
  });
  const ctx = {
    clearRect() {
      draws++;
      arcs = 0;
    },
    arc() {
      arcs++;
    },
    fill() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    setTransform() {},
  };
  const canvas = { parentElement: host, getContext: () => ctx };
  class Element {
    constructor(control = false) {
      this.control = control;
    }
    closest() {
      return this.control ? this : null;
    }
  }
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
      new URL("../src/components/hero-background.tsx", import.meta.url),
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
        };
      if (name === "react/jsx-runtime") return { jsx: (_type, props) => props };
      if (name === "@/lib/hero-scene") return scene;
      throw new Error(`Unexpected import: ${name}`);
    },
    document,
    window,
    Element,
    matchMedia: () => media,
    devicePixelRatio: 3,
    performance: { now: () => now },
    requestAnimationFrame: (fn) => {
      const id = ++sequence;
      frames.set(id, fn);
      return id;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: makeObserver("resize"),
    IntersectionObserver: makeObserver("intersection"),
    MutationObserver: makeObserver("theme"),
  });
  exports.HeroBackground({ running: true });
  refs[0].current = canvas;
  for (const effect of effects) {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  }
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
  const pointer = (type, x, y, control = false, pointerType = "mouse") =>
    host.fire(type, {
      clientX: x,
      clientY: y,
      target: new Element(control),
      isPrimary: true,
      button: 0,
      pointerId: 1,
      pointerType,
    });
  visible(true);
  advance(100);
  return {
    canvas,
    frames,
    document,
    window,
    media,
    host,
    observers,
    visible,
    advance,
    pointer,
    get draws() {
      return draws;
    },
    get arcs() {
      return arcs;
    },
    pause() {
      refs[1].current = false;
      refs[2].current();
    },
    unmount() {
      cleanups.forEach((fn) => fn());
    },
  };
}

test("animation sleeps offscreen, in hidden tabs and on pause, and cleans up on unmount", () => {
  const env = mount();
  assert.ok(env.draws > 1);
  for (const stop of [
    () => env.visible(false),
    () => {
      env.document.hidden = true;
      env.document.fire("visibilitychange");
    },
    () => env.pause(),
  ]) {
    stop();
    const draws = env.draws;
    env.advance(10000);
    assert.equal(env.draws, draws);
    assert.equal(env.frames.size, 0);
    env.document.hidden = false;
    env.document.fire("visibilitychange");
    env.visible(true);
  }
  env.unmount();
  assert.equal(env.frames.size, 0);
  assert.equal(env.host.listeners.size, 0);
  assert.equal(env.document.listeners.size, 0);
  assert.equal(env.window.listeners.size, 0);
  assert.equal(env.media.listeners.size, 0);
  assert.ok(env.observers.every((o) => o.disconnected));
});

test("reduced motion paints a static scene, including after taps and preference changes", () => {
  const env = mount({ reduced: true });
  const draws = env.draws;
  env.pointer("pointerdown", 700, 200);
  env.pointer("pointerup", 700, 200);
  env.advance(2000);
  assert.equal(env.draws, draws);
  assert.equal(env.frames.size, 0);
  env.media.matches = false;
  env.media.fire("change");
  env.advance(100);
  assert.ok(env.draws > draws);
  env.media.matches = true;
  env.media.fire("change");
  assert.equal(env.frames.size, 0);
  env.unmount();
});

test("blank taps create finite bounded signals; controls, drags and cancelled touches do not", () => {
  const env = mount();
  const baseline = env.arcs;
  for (const control of [true, false]) {
    env.pointer("pointerdown", 700, 200, control);
    env.pointer("pointerup", control ? 700 : 750, 200, control);
    env.advance(100);
    assert.equal(env.arcs, baseline);
  }
  env.pointer("pointerdown", 700, 200, false, "touch");
  env.pointer("pointercancel", 700, 200, false, "touch");
  env.pointer("pointerup", 700, 200, false, "touch");
  env.advance(100);
  assert.equal(env.arcs, baseline);
  for (let i = 0; i < 30; i++) {
    env.pointer("pointerdown", 700, 200);
    env.pointer("pointerup", 700, 200);
    env.advance(100);
    assert.ok(env.arcs > baseline && env.arcs <= baseline + 10);
  }
  env.advance(2500);
  assert.equal(env.arcs, baseline);
  env.unmount();
});

test("high density 4K displays respect the total canvas pixel budget", () => {
  const env = mount({ width: 3840, height: 1400 });
  assert.ok(
    env.canvas.width * env.canvas.height <= scene.heroScene.maxPixels + 6000,
  );
  env.unmount();
});

test("pointer trails expire after leaving; touch movement never creates hover trails", () => {
  const env = mount();
  const baseline = env.arcs;
  env.pointer("pointermove", 700, 200, false, "touch");
  env.advance(100);
  assert.equal(env.arcs, baseline);
  env.pointer("pointermove", 700, 200);
  env.advance(100);
  assert.ok(env.arcs > baseline);
  env.pointer("pointerleave", 700, 200);
  env.advance(2000);
  assert.equal(env.arcs, baseline);
  env.unmount();
});
