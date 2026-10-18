"use client";

import { useSyncExternalStore } from "react";
import { Mouse, MouseOff } from "lucide-react";
import { Tooltip } from "radix-ui";
import {
  subscribeAnimations,
  getAnimationsSnapshot,
  getAnimationsServerSnapshot,
  toggleAnimations,
} from "@/lib/animation-preference";

export function useAnimations() {
  return useSyncExternalStore(subscribeAnimations, getAnimationsSnapshot, getAnimationsServerSnapshot);
}

export function AnimationToggle() {
  const enabled = useAnimations();
  const label = enabled ? "Disable mouse effects" : "Enable mouse effects";
  const Icon = enabled ? Mouse : MouseOff;
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="animation-toggle"
            aria-label={label}
            aria-pressed={enabled}
            onClick={toggleAnimations}
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content sideOffset={8} className="animation-tooltip">
            {label}
            <Tooltip.Arrow className="fill-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
