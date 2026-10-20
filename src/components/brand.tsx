import { MazeGlyph } from "@/components/maze-glyph";

export function Brand() {
  return (
    <span className="brand flex items-center gap-2.5">
      <MazeGlyph className="h-9 w-8 shrink-0 text-primary" />
      <span className="brand-wordmark font-sans text-lg font-bold tracking-[-0.045em]">
        LABYRINTH
        <span className="brand-suffix ml-1.5 font-mono text-[10px] font-medium tracking-normal text-muted">
          DNS
        </span>
      </span>
    </span>
  );
}
