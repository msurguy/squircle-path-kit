import type { ReactNode } from "react";
import { getSquirclePath, getSquircleRectPath } from "../../../../src";

const figmaRect = getSquircleRectPath({
  x: 30,
  y: 15,
  width: 180,
  height: 130,
  cornerRadius: 40,
  cornerSmoothing: 0.68,
});

const perCornerRect = getSquircleRectPath({
  x: 30,
  y: 15,
  width: 180,
  height: 130,
  topLeftRadius: 10,
  topRightRadius: 52,
  bottomRightRadius: 30,
  bottomLeftRadius: 0,
  cornerSmoothing: 0.72,
});

const hexagon = getSquirclePath(
  Array.from({ length: 6 }, (_, k) => {
    const th = ((-90 + k * 60) * Math.PI) / 180;
    return { x: 120 + 72 * Math.cos(th), y: 80 + 72 * Math.sin(th) };
  }),
  { defaultRadius: 18, defaultSmoothness: 0.7 }
);

const clipRect = getSquircleRectPath({
  x: 55,
  y: 15,
  width: 130,
  height: 130,
  cornerRadius: 36,
  cornerSmoothing: 0.8,
});

function Figure({
  caption,
  sketchClass,
  children,
}: {
  caption: string;
  sketchClass: string;
  children: ReactNode;
}) {
  return (
    <figure className={`figure ${sketchClass}`} style={{ margin: 0 }}>
      <svg viewBox="0 0 240 160" role="img" aria-label={caption}>
        {children}
      </svg>
      <figcaption className="figure-caption">{caption}</figcaption>
    </figure>
  );
}

export function PreviewStrip() {
  return (
    <>
      <p className="preview-kicker">PREVIEW</p>
      <div className="preview-strip">
        <Figure caption="Figma-smooth rectangle" sketchClass="sketch--a">
          <path d={figmaRect} fill="var(--accent-purple-soft)" stroke="var(--accent-purple)" strokeWidth="2" />
        </Figure>

        <Figure caption="Per-corner radii" sketchClass="sketch--b tilt-r">
          <path d={perCornerRect} fill="var(--accent-green-soft)" stroke="var(--accent-green)" strokeWidth="2" />
        </Figure>

        <Figure caption="Arbitrary polygon" sketchClass="sketch--c">
          <path d={hexagon} fill="var(--accent-blue-soft)" stroke="var(--accent-blue)" strokeWidth="2" />
        </Figure>

        <Figure caption="CSS / image clipping" sketchClass="sketch--a tilt-l">
          <defs>
            <clipPath id="preview-clip">
              <path d={clipRect} />
            </clipPath>
            <linearGradient id="preview-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b7cdf1" />
              <stop offset="0.55" stopColor="#e8eef9" />
              <stop offset="1" stopColor="#f3ede2" />
            </linearGradient>
          </defs>
          <g clipPath="url(#preview-clip)">
            <rect x="55" y="15" width="130" height="130" fill="url(#preview-sky)" />
            <path d="M45 145 L 95 60 L 118 100 L 138 72 L 195 145 Z" fill="#7e8aa6" />
            <path d="M95 60 L 106 79 L 99 76 L 92 82 Z" fill="#fdfdfb" />
            <path d="M138 72 L 149 88 L 141 84 L 134 90 Z" fill="#fdfdfb" />
            <circle cx="160" cy="42" r="11" fill="#fbf6e5" stroke="#e7d9ab" />
          </g>
          <path d={clipRect} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        </Figure>
      </div>
    </>
  );
}
