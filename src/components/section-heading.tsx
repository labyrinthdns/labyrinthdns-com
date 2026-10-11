import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "section-heading max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-sans text-3xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
