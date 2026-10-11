"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { DropdownMenu } from "radix-ui";
import { Check, Laptop, Moon, Sun } from "lucide-react";

// Hydration-safe mounted flag without setState-in-effect:
// the server snapshot is always false, the client snapshot always true.
const subscribeNoop = () => () => {};

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Change theme"
          title="Change theme"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-primary/40 hover:text-fg"
        >
          {mounted && theme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="end"
          className="z-50 min-w-36 rounded-md border border-border bg-surface p-1 shadow-3"
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => setTheme(option.value)}
              className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-raised"
            >
              <option.icon className="size-4 text-muted" />
              <span className="flex-1">{option.label}</span>
              {mounted && theme === option.value ? (
                <Check className="size-3.5 text-primary" />
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
