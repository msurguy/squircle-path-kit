import type { SquirclePoint } from "../../src";

export type CodeTab = "js" | "svg" | "react" | "react-native" | "css";

interface SnippetInput {
  points: SquirclePoint[];
  path: string;
  fillColor: string;
  fillOpacity: number;
  strokeWidth: number;
  precision: number;
}

const pointLiteral = (points: SquirclePoint[]) =>
  JSON.stringify(
    points.map((point) => ({
      x: Number(point.x.toFixed(2)),
      y: Number(point.y.toFixed(2)),
      radius: point.radius,
      smoothness: point.smoothness,
    })),
    null,
    2
  ).replace(/"([^"]+)":/g, "$1:");

export function makeSnippets(input: SnippetInput): Record<CodeTab, string> {
  const { points, path, fillColor, fillOpacity, strokeWidth, precision } = input;
  const pointsCode = pointLiteral(points);

  return {
    js: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointsCode};

const d = getSquirclePath(points, { precision: ${precision} });`,

    svg: `<svg viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
  <path
    d="${path}"
    fill="${fillColor}"
    fill-opacity="${fillOpacity}"
    stroke="${fillColor}"
    stroke-width="${strokeWidth}"
  />
</svg>`,

    react: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointsCode};

export function SquircleShape() {
  const d = getSquirclePath(points, { precision: ${precision} });

  return (
    <svg viewBox="0 0 600 440" role="img" aria-label="Smoothed custom shape">
      <path
        d={d}
        fill="${fillColor}"
        fillOpacity={${fillOpacity}}
        stroke="${fillColor}"
        strokeWidth={${strokeWidth}}
      />
    </svg>
  );
}`,

    "react-native": `import Svg, { Defs, ClipPath, Path, Image } from "react-native-svg";
import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointsCode};
const d = getSquirclePath(points, { precision: ${precision} });

export function SquircleImage({ href }) {
  return (
    <Svg width={300} height={220} viewBox="0 0 600 440">
      <Defs>
        <ClipPath id="shape">
          <Path d={d} />
        </ClipPath>
      </Defs>
      <Image
        href={href}
        width={600}
        height={440}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#shape)"
      />
      <Path d={d} fill="none" stroke="${fillColor}" strokeWidth={${strokeWidth}} />
    </Svg>
  );
}`,

    css: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointsCode};
const d = getSquirclePath(points, { precision: ${precision} });

element.style.clipPath = \`path('\${d}')\`;`,
  };
}
