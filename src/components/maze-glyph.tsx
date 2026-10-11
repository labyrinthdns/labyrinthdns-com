export function MazeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 144 174"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M31 10H18C12.5 10 8 14.5 8 20V152C8 157.5 12.5 162 18 162H111V145H25V27H31V10ZM38 10H51C56.5 10 61 14.5 61 20V110H126C131.5 110 136 114.5 136 120V137H119V127H54C48.5 127 44 122.5 44 117V27H38V10Z"
      />
      <circle cx="127" cy="153" r="9" fill="var(--brand-gold, #df880c)" />
    </svg>
  );
}
