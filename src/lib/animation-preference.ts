export const animationStorageKey = "labyrinth-animations";

// One shared preference for every header instance and the body-level scene.
// The server snapshot stays off so hydration cannot briefly start unwanted motion.
export function createAnimationPreference(browser: Pick<Window, "localStorage" | "matchMedia" | "addEventListener" | "removeEventListener">) {
  let enabled = false;
  let explicit: boolean | null = null;
  let stop: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: boolean) => {
    enabled = next;
    listeners.forEach((listener) => listener());
  };
  const read = () => {
    try {
      const value = browser.localStorage.getItem(animationStorageKey);
      return value === "on" ? true : value === "off" ? false : null;
    } catch {
      return null;
    }
  };
  return {
    getSnapshot: () => enabled,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!stop) {
        const media = browser.matchMedia("(prefers-reduced-motion: reduce)");
        explicit = read();
        const sync = () => publish(explicit ?? !media.matches);
        const storage = (event: StorageEvent) => {
          if (event.key !== null && event.key !== animationStorageKey) return;
          explicit = read();
          sync();
        };
        media.addEventListener("change", sync);
        browser.addEventListener("storage", storage);
        stop = () => {
          media.removeEventListener("change", sync);
          browser.removeEventListener("storage", storage);
        };
        sync();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          stop?.();
          stop = undefined;
        }
      };
    },
    toggle() {
      explicit = !enabled;
      try {
        browser.localStorage.setItem(animationStorageKey, explicit ? "on" : "off");
      } catch {
        // Private/restricted storage still permits an in-memory preference.
      }
      publish(explicit);
    },
  };
}

let preference: ReturnType<typeof createAnimationPreference> | undefined;
const getPreference = () => (preference ??= createAnimationPreference(window));
export const subscribeAnimations = (listener: () => void) => getPreference().subscribe(listener);
export const getAnimationsSnapshot = () => preference?.getSnapshot() ?? false;
export const getAnimationsServerSnapshot = () => false;
export const toggleAnimations = () => getPreference().toggle();
