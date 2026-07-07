function ChipCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      <path d="M5.5 9.5 L 8 12 L 12.5 6" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChipHex() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 1.8 L 15.3 5.4 L 15.3 12.6 L 9 16.2 L 2.7 12.6 L 2.7 5.4 Z" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChipSliders() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2 5.5 H 16 M2 12.5 H 16" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="6.5" cy="5.5" r="2.4" fill="var(--paper-raised)" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx="11.5" cy="12.5" r="2.4" fill="var(--paper-raised)" stroke="var(--ink)" strokeWidth="1.6" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="overview" className="doc-section hero">

      <h1 className="hero-title">
        Figma-exact squircle paths for <span className="u-squiggle">any</span> shape.
      </h1>

      <p className="hero-lede">
        Corner rounding and smoothing for rectangles and arbitrary polygons. Matches Figma&apos;s
        output within <strong>0.01px</strong> across 60°, 90°, and 120° corners, per-corner radii,
        and budget-clamped cases.
      </p>

      <div className="chips">
        <span className="chip sketch--a">
          <ChipCheck />
          Figma-exact (≤ 0.01px)
        </span>
        <span className="chip sketch--b tilt-r">
          <ChipHex />
          Any closed polygon
        </span>
        <span className="chip sketch--c tilt-l">
          <ChipSliders />
          Per-corner radii + smoothing
        </span>
      </div>
    </section>
  );
}
