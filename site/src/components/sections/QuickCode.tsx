import { CodeBlock } from "../ui/CodeBlock";

const heroSnippet = `import { getSquircleRectPath } from "@msurguy/squircle-path-kit";

const d = getSquircleRectPath({
  width: 320,
  height: 180,
  cornerRadius: 48,
  cornerSmoothing: 0.68, // Figma's ξ
});`;

export function QuickCode() {
  return (
    <>
      <div className="quick-code">
        <CodeBlock code={heroSnippet} lang="TS" sketchClass="sketch--b" />
        <ul className="hand-bullets" aria-label="Highlights">
          <li>Pure JS (ESM)</li>
          <li>Tiny runtime</li>
          <li>Zero deps</li>
        </ul>
      </div>
      <a className="more-link" href="#rectangles">
        → More examples
      </a>
    </>
  );
}
