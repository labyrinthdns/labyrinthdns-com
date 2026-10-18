import assert from "node:assert/strict";
import test from "node:test";
import { animationStorageKey, createAnimationPreference } from "../src/lib/animation-preference.ts";

function browser({ reduced = false, saved = null, restricted = false } = {}) {
  const events = new Map();
  const changes = new Map();
  let value = saved;
  const media = {
    matches: reduced,
    addEventListener: (name, fn) => changes.set(name, fn),
    removeEventListener: (name) => changes.delete(name),
  };
  const env = {
    localStorage: {
      getItem() { if (restricted) throw new Error("blocked"); return value; },
      setItem(key, next) { assert.equal(key, animationStorageKey); if (restricted) throw new Error("blocked"); value = next; },
    },
    matchMedia: () => media,
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: (name) => events.delete(name),
  };
  return { env, media, events, changes, saved: () => value,
    system(reduce) { media.matches = reduce; changes.get("change")?.(); },
    external(next) { value = next; events.get("storage")?.({ key: animationStorageKey }); },
  };
}

test("first visit follows reduced motion until explicitly toggled; choice survives reload", () => {
  const b = browser({ reduced: true });
  const store = createAnimationPreference(b.env);
  const stop = store.subscribe(() => {});
  assert.equal(store.getSnapshot(), false);
  b.system(false);
  assert.equal(store.getSnapshot(), true);
  store.toggle();
  assert.equal(b.saved(), "off");
  b.system(true);
  b.system(false);
  assert.equal(store.getSnapshot(), false);
  stop();
  const reloaded = createAnimationPreference(b.env);
  const stopReloaded = reloaded.subscribe(() => {});
  assert.equal(reloaded.getSnapshot(), false);
  stopReloaded();
});

test("saved on can override reduced motion and multiple consumers stay synchronized", () => {
  const b = browser({ reduced: true, saved: "on" });
  const store = createAnimationPreference(b.env);
  let notifications = 0;
  const first = store.subscribe(() => notifications++);
  const second = store.subscribe(() => notifications++);
  assert.equal(store.getSnapshot(), true);
  store.toggle();
  assert.equal(store.getSnapshot(), false);
  assert.ok(notifications >= 3);
  first();
  assert.equal(b.events.size, 1);
  b.external("on");
  assert.equal(store.getSnapshot(), true);
  second();
  assert.equal(b.events.size, 0);
  assert.equal(b.changes.size, 0);
});

test("restricted storage still allows toggling and invalid values follow the system", () => {
  for (const options of [{ restricted: true }, { saved: "invalid" }]) {
    const b = browser(options);
    const store = createAnimationPreference(b.env);
    const stop = store.subscribe(() => {});
    assert.equal(store.getSnapshot(), true);
    assert.doesNotThrow(() => store.toggle());
    assert.equal(store.getSnapshot(), false);
    stop();
  }
});
