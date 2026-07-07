function IconTarget() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="8" fill="none" stroke="var(--ink)" strokeWidth="1.7" />
      <path d="M13 1.5 V 7 M13 19 V 24.5 M1.5 13 H 7 M19 13 H 24.5" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="13" cy="13" r="1.8" fill="var(--ink)" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <path
        d="M13 2.5 L 15.9 9.4 L 23.5 10 L 17.8 15 L 19.5 22.5 L 13 18.6 L 6.5 22.5 L 8.2 15 L 2.5 10 L 10.1 9.4 Z"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRuler() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect x="8" y="2.5" width="10" height="21" rx="2" fill="none" stroke="var(--ink)" strokeWidth="1.7" />
      <path d="M8 7 H 12.5 M8 11 H 11 M8 15 H 12.5 M8 19 H 11" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    icon: <IconTarget />,
    title: "Exact",
    body: "Verified in the test suite to match Figma's own SVG exports within 0.01px.",
    sketch: "sketch--a",
  },
  {
    icon: <IconStar />,
    title: "Any shape",
    body: "Works with triangles, hexagons, stars, arrows, and custom polygons.",
    sketch: "sketch--b tilt-r",
  },
  {
    icon: <IconRuler />,
    title: "Figma-like",
    body: "Per-corner radii, smoothing, and clamping behave just like Figma.",
    sketch: "sketch--c tilt-l",
  },
];

export function FeatureCards() {
  return (
    <div className="feature-cards">
      {features.map((feature) => (
        <article key={feature.title} className={`feature-card ${feature.sketch}`}>
          {feature.icon}
          <div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
