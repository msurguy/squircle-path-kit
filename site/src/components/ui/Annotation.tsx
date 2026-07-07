import type { ReactNode } from "react";

const arrows = {
  "down-left": "M34 2 C 26 14, 14 20, 4 24 M11 19 L 3 25 L 12 27",
  "up-right": "M4 26 C 12 14, 22 8, 32 4 M25 3 L 33 3 L 30 11",
  left: "M34 8 C 24 4, 14 6, 4 10 M11 4 L 3 10 L 12 14",
} as const;

export type ArrowDirection = keyof typeof arrows;

/**
 * Blue handwritten note with an optional hand-drawn arrow, used for the
 * margin commentary that gives the sketch layout its voice.
 */
export function Annotation({
  children,
  arrow,
  className = "",
}: {
  children: ReactNode;
  arrow?: ArrowDirection;
  className?: string;
}) {
  return (
    <div className={`annotation ${className}`} aria-hidden="true">
      {arrow ? (
        <svg width="36" height="28" viewBox="0 0 36 28">
          <path
            d={arrows[arrow]}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <span>{children}</span>
    </div>
  );
}
