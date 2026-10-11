"use client";

import { useCallback, useEffect, useState } from "react";
import { Tooltip } from "radix-ui";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), timeout);
    return () => clearTimeout(timer);
  }, [copied, timeout]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard unavailable (insecure context or denied) — keep icon unchanged.
    }
  }, []);

  return { copied, copy };
}

export function CopyButton({
  text,
  className,
  label = "Copy to clipboard",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const { copied, copy } = useCopy();

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={() => copy(text)}
            aria-label={copied ? "Copied" : label}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-fg",
              className,
            )}
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-50 rounded-md border border-border bg-raised px-2 py-1 text-xs text-fg shadow-2"
          >
            {copied ? "Copied" : label}
            <Tooltip.Arrow className="fill-raised" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function CopyCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "copy-command flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm shadow-2",
        className,
      )}
    >
      <span aria-hidden="true" className="shrink-0 select-none text-primary">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-fg">
        {command}
      </code>
      <CopyButton text={command} className="shrink-0" />
    </div>
  );
}
