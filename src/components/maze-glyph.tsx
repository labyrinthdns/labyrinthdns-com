export function MazeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 12h3V9H9v6h9V6H6v12h15" />
    </svg>
  );
}
