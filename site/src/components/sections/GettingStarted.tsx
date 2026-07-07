import { CodeBlock } from "../ui/CodeBlock";
import { DocSection } from "./DocSection";

const quickStart = `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

const d = getSquircleRectPath({
  width: 200,
  height: 200,
  cornerRadius: 40,
  cornerSmoothing: 0.6, // Figma's ξ — 0.6 ≈ the iOS app-icon shape
});

// <path d={d} fill="tomato" />`;

export function GettingStarted() {
  return (
    <>
      <DocSection id="installation" kicker="Getting started" title="Installation">
        <p>
          The npm package is intentionally small: published files are limited to{" "}
          <code>dist</code>, <code>README.md</code>, and <code>LICENSE</code>. It ships ESM, CJS,
          and TypeScript declarations with zero runtime dependencies.
        </p>
        <CodeBlock code="npm install @msurguy/squircle-path-kit" lang="BASH" plain sketchClass="sketch--a" />
      </DocSection>

      <DocSection id="quick-start" kicker="Getting started" title="Quick start">
        <p>
          Generate an SVG path <code>d</code> string and drop it into a <code>&lt;path&gt;</code>,
          a CSS <code>clip-path</code>, or anything else that accepts path data.
        </p>
        <CodeBlock code={quickStart} lang="TS" sketchClass="sketch--c" />
      </DocSection>
    </>
  );
}
