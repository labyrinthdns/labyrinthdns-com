import { MazeGlyph } from "@/components/maze-glyph";

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <MazeGlyph className="size-7 text-primary" />
      <span className="font-sans text-xl font-semibold tracking-[-0.06em]">
        Labyrinth
        <span className="ml-1.5 font-mono text-sm font-medium text-muted">
          DNS
        </span>
      </span>
    </span>
  );
}
