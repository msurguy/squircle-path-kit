import type { SquirclePoint } from "../../src";
import type { RectState } from "./components/playground/state";

export type OutTab = "path" | "js" | "react" | "css";

export const outTabs: Array<{ id: OutTab; label: string }> = [
  { id: "path", label: "SVG PATH" },
  { id: "js", label: "JS" },
  { id: "react", label: "REACT" },
  { id: "css", label: "CSS" },
];

const FILL = "#7c3aed";

function rectOptionsLiteral(rect: RectState, indent = "  ") {
  const { width, height, cornerRadius, cornerSmoothing, corners, precision } = rect;
  const lines = [`width: ${width},`, `height: ${height},`];
  const perCorner = Object.values(corners).some((value) => value !== null);
  if (perCorner) {
    lines.push(
      `topLeftRadius: ${corners.tl ?? cornerRadius},`,
      `topRightRadius: ${corners.tr ?? cornerRadius},`,
      `bottomRightRadius: ${corners.br ?? cornerRadius},`,
      `bottomLeftRadius: ${corners.bl ?? cornerRadius},`
    );
  } else {
    lines.push(`cornerRadius: ${cornerRadius},`);
  }
  lines.push(`cornerSmoothing: ${cornerSmoothing},`);
  if (precision !== 2) lines.push(`precision: ${precision},`);
  return lines.map((line) => indent + line).join("\n");
}

export function makeRectSnippets(rect: RectState, d: string): Record<OutTab, string> {
  const options = rectOptionsLiteral(rect);

  return {
    path: `<path d="${d}" fill="${FILL}" />`,

    js: `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

const d = getSquircleRectPath({
${options}
});`,

    react: `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

export function Squircle() {
  const d = getSquircleRectPath({
${rectOptionsLiteral(rect, "    ")}
  });

  return (
    <svg width={${rect.width}} height={${rect.height}} viewBox="0 0 ${rect.width} ${rect.height}">
      <path d={d} fill="currentColor" />
    </svg>
  );
}`,

    css: `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

element.style.clipPath = \`path('\${getSquircleRectPath({
${options}
})}')\`;`,
  };
}

const pointLiteral = (points: SquirclePoint[], indent = "  ") =>
  JSON.stringify(
    points.map((point) => ({
      x: Number(point.x.toFixed(2)),
      y: Number(point.y.toFixed(2)),
      radius: point.radius,
      smoothness: point.smoothness,
    })),
    null,
    2
  )
    .replace(/"([^"]+)":/g, "$1:")
    .split("\n")
    .map((line, index) => (index === 0 ? line : indent + line))
    .join("\n");

export function makePolySnippets(
  points: SquirclePoint[],
  options: { defaultRadius: number; defaultSmoothness: number; precision: number },
  d: string
): Record<OutTab, string> {
  const { defaultRadius, defaultSmoothness, precision } = options;
  const optionsCode = `{ defaultRadius: ${defaultRadius}, defaultSmoothness: ${defaultSmoothness}, precision: ${precision} }`;

  return {
    path: `<path d="${d}" fill="${FILL}" />`,

    js: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointLiteral(points, "")};

const d = getSquirclePath(points, ${optionsCode});`,

    react: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointLiteral(points, "")};

export function SquircleShape() {
  const d = getSquirclePath(points, ${optionsCode});

  return (
    <svg viewBox="0 0 600 440">
      <path d={d} fill="currentColor" />
    </svg>
  );
}`,

    css: `import { getSquirclePath } from "@msurguy/squircle-path-kit";

const points = ${pointLiteral(points, "")};
const d = getSquirclePath(points, ${optionsCode});

element.style.clipPath = \`path('\${d}')\`;`,
  };
}
