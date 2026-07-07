import { CodeBlock } from "../ui/CodeBlock";
import { DocSection } from "./DocSection";

const typesSnippet = `interface SquirclePoint {
  x: number;
  y: number;
  radius?: number;      // falls back to defaultRadius
  smoothness?: number;  // falls back to defaultSmoothness
}

interface SquircleOptions {
  defaultRadius?: number;      // default 0
  defaultSmoothness?: number;  // ξ ∈ [0,1], default 0
  precision?: number;          // output decimals, default 2
}

interface SquircleRectOptions {
  width: number;
  height: number;
  x?: number;
  y?: number;
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomRightRadius?: number;
  bottomLeftRadius?: number;
  cornerSmoothing?: number;    // Figma's ξ
  precision?: number;
}`;

export function Api() {
  return (
    <>
      <DocSection id="api-getsquirclepath" kicker="API" title="getSquirclePath(points, options?)">
        <p>Returns the SVG path <code>d</code> string for any closed polygon.</p>
        <div className="api-table-wrap">
          <table className="api-table">
            <thead>
              <tr>
                <th>Param</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>points</code></td>
                <td><code>SquirclePoint[]</code></td>
                <td>
                  ≥3 vertices of a closed polygon (<code>Z</code> is appended). Each:{" "}
                  <code>{"{ x, y, radius?, smoothness? }"}</code>
                </td>
              </tr>
              <tr>
                <td><code>options.defaultRadius</code></td>
                <td><code>number</code></td>
                <td>Radius for points without their own. Default <code>0</code>.</td>
              </tr>
              <tr>
                <td><code>options.defaultSmoothness</code></td>
                <td><code>number</code></td>
                <td>Smoothing ξ ∈ [0,1] for points without their own. Default <code>0</code>.</td>
              </tr>
              <tr>
                <td><code>options.precision</code></td>
                <td><code>number</code></td>
                <td>Output decimal places. Default <code>2</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="api-getsquirclerectpath" kicker="API" title="getSquircleRectPath(options)">
        <p>
          Convenience wrapper for axis-aligned rectangles. Individual corner radii override{" "}
          <code>cornerRadius</code>. Radii clamp to half the short side, exactly like Figma.
        </p>
        <CodeBlock
          code={`getSquircleRectPath({ width, height, x?, y?, cornerRadius?,
  topLeftRadius?, topRightRadius?, bottomRightRadius?, bottomLeftRadius?,
  cornerSmoothing?, precision? });`}
          lang="TS"
          sketchClass="sketch--b"
        />
      </DocSection>

      <DocSection id="api-types" kicker="API" title="Types">
        <p>All types are exported from the package root.</p>
        <CodeBlock code={typesSnippet} lang="TS" sketchClass="sketch--c tilt-l" />
      </DocSection>
    </>
  );
}
