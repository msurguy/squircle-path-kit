import { CodeBlock } from "../ui/CodeBlock";
import { DocSection } from "./DocSection";

const rectSnippet = `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

const d = getSquircleRectPath({
  width: 200,
  height: 200,
  cornerRadius: 40,
  cornerSmoothing: 0.6,
});`;

const perCornerSnippet = `getSquircleRectPath({
  x: 10,
  y: 10,
  width: 240,
  height: 240,
  topLeftRadius: 10,
  topRightRadius: 40,
  bottomRightRadius: 80,
  bottomLeftRadius: 0,
  cornerSmoothing: 0.6,
  precision: 3,
});`;

const polygonSnippet = `import { getSquirclePath } from "@msurguy/squircle-path-kit";

// A hexagon with smooth corners
const pts = Array.from({ length: 6 }, (_, k) => {
  const th = ((-90 + k * 60) * Math.PI) / 180;
  return { x: 120 + 120 * Math.cos(th), y: 120 + 120 * Math.sin(th) };
});

const d = getSquirclePath(pts, { defaultRadius: 40, defaultSmoothness: 0.6 });`;

const perPointSnippet = `getSquirclePath(
  [
    { x: 0, y: 0, radius: 10, smoothness: 1.0 },
    { x: 240, y: 0, radius: 40 }, // uses defaults below
    { x: 240, y: 240, radius: 80, smoothness: 0.3 },
    { x: 0, y: 240 }, // radius 0 -> sharp corner
  ],
  { defaultRadius: 20, defaultSmoothness: 0.6 },
);`;

const cssSnippet = `element.style.clipPath = \`path('\${getSquircleRectPath({
  width,
  height,
  cornerRadius: 24,
  cornerSmoothing: 0.8,
})}')\`;`;

const reactSnippet = `function Squircle({ size = 200, radius = 40, smoothing = 0.6 }) {
  const d = getSquircleRectPath({
    width: size,
    height: size,
    cornerRadius: radius,
    cornerSmoothing: smoothing,
  });
  return (
    <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}`;

const reactNativeSnippet = `import Svg, { Defs, ClipPath, Image, Path } from "react-native-svg";
import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

const d = getSquircleRectPath({
  width: 300,
  height: 180,
  cornerRadius: 32,
  cornerSmoothing: 0.7,
});

export function SquircleImage({ href }) {
  return (
    <Svg width={300} height={180} viewBox="0 0 300 180">
      <Defs>
        <ClipPath id="clip">
          <Path d={d} />
        </ClipPath>
      </Defs>
      <Image
        href={href}
        width={300}
        height={180}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#clip)"
      />
    </Svg>
  );
}`;

export function Guides() {
  return (
    <>
      <DocSection id="rectangles" kicker="Guides" title="Rectangles">
        <p>
          <code>getSquircleRectPath</code> mirrors Figma&apos;s rectangle properties —{" "}
          <code>cornerRadius</code>, <code>cornerSmoothing</code>, and per-corner radii. Radii
          clamp to half the short side, exactly like Figma.
        </p>
        <CodeBlock code={rectSnippet} lang="TS" sketchClass="sketch--a" />
      </DocSection>

      <DocSection id="per-corner-radii" kicker="Guides" title="Per-corner radii">
        <p>
          Individual corner radii override <code>cornerRadius</code>. Offsets (<code>x</code>,{" "}
          <code>y</code>) and output <code>precision</code> are supported too.
        </p>
        <CodeBlock code={perCornerSnippet} lang="TS" sketchClass="sketch--b tilt-r" />
      </DocSection>

      <DocSection id="arbitrary-polygons" kicker="Guides" title="Arbitrary polygons">
        <p>
          Unlike rectangle-only libraries, this one handles <strong>any closed polygon</strong> —
          triangles, hexagons, stars, arrows, custom shapes — with a different radius and
          smoothing value per corner if you want.
        </p>
        <CodeBlock code={polygonSnippet} lang="TS" sketchClass="sketch--c" />
        <p>Each point can override radius and smoothing:</p>
        <CodeBlock code={perPointSnippet} lang="TS" sketchClass="sketch--a tilt-l" />
      </DocSection>

      <DocSection id="css-clipping" kicker="Guides" title="CSS & clipping">
        <p>
          The generated path drops straight into CSS <code>clip-path</code> for squircle-masked
          images, cards, and avatars.
        </p>
        <CodeBlock code={cssSnippet} lang="TS" sketchClass="sketch--b" />
      </DocSection>

      <DocSection id="react" kicker="Guides" title="React">
        <p>Compute the path during render — it&apos;s a pure, fast string builder.</p>
        <CodeBlock code={reactSnippet} lang="TSX" sketchClass="sketch--c tilt-r" />
      </DocSection>

      <DocSection id="react-native" kicker="Guides" title="React Native">
        <p>
          The runtime is pure JavaScript and the package exposes a <code>react-native</code> entry
          point that uses the same ESM build. Pair it with <code>react-native-svg</code>:
        </p>
        <CodeBlock code={reactNativeSnippet} lang="TSX" sketchClass="sketch--a" />
      </DocSection>
    </>
  );
}
