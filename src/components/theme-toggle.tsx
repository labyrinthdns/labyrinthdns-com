"use client";

import { useId, useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Popover } from "radix-ui";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";

const subscribeNoop = () => () => {};
const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const current =
    choices.find((choice) => mounted && choice.value === theme) ?? choices[2];
  const Icon = current.icon;
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="appearance-trigger"
          aria-label={`Color theme: ${current.label}`}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{current.label}</span>
          <ChevronDown
            size={12}
            className="appearance-chevron"
            aria-hidden="true"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          ref={panel}
          role="dialog"
          aria-label="Appearance"
          align="end"
          sideOffset={10}
          collisionPadding={16}
          className="appearance-panel"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            panel.current
              ?.querySelector<HTMLInputElement>("input:checked")
              ?.focus({ preventScroll: true });
          }}
        >
          <div className="appearance-heading">
            <span>Appearance</span>
            <span>Your space, your style.</span>
          </div>
          <fieldset className="appearance-options">
            <legend className="sr-only">Color theme</legend>
            {choices.map(({ value, label, icon: ChoiceIcon }) => (
              <label className="appearance-option" key={value}>
                <input
                  type="radio"
                  name={`${id}-theme`}
                  value={value}
                  checked={current.value === value}
                  onChange={() => setTheme(value)}
                />
                <span
                  className={`appearance-preview appearance-preview-${value}`}
                  aria-hidden="true"
                >
                  <span className="appearance-window">
                    <span className="appearance-sidebar" />
                    <span className="appearance-content">
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span className="appearance-choice-icon">
                    <ChoiceIcon size={14} />
                  </span>
                  <span className="appearance-check">
                    <Check size={12} />
                  </span>
                </span>
                <span className="appearance-label">{label}</span>
              </label>
            ))}
          </fieldset>
          <p className="appearance-status" aria-live="polite">
            <Icon size={13} aria-hidden="true" />
            {current.value === "system"
              ? "Follows your device’s appearance."
              : `${current.label} mode, saved for your next visit.`}
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
