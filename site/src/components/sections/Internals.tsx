import { CodeBlock } from "../ui/CodeBlock";
import { DocSection } from "./DocSection";

const mathBlock = `q = R / tan(φ/2)            tangent length of plain rounding
p = (1 + ξ) · q             total edge length consumed
β = (turn / 2) · ξ          heading change per smoothing ramp
t = R · tan(β/2)            tangent length at the ramp/arc junction
arc sweep = turn · (1 − ξ)  the circular arc shrinks as ξ grows`;

export function Internals() {
  return (
    <>
      <DocSection id="how-it-matches-figma" kicker="Internals" title="How it matches Figma">
        <p>
          The construction was reverse-engineered from ground-truth SVG exports produced by Figma
          itself. Per corner with opening angle φ (turn = π − φ), radius R, smoothing ξ:
        </p>
        <CodeBlock code={mathBlock} lang="MATH" plain sketchClass="sketch--a" />
        <p>
          Each corner is drawn as: smoothing cubic → circular arc (as cubics) → smoothing cubic.
          The smoothing cubic&apos;s control points sit at distances <code>p</code>,{" "}
          <code>p − a</code>, and <code>q − t</code> from the vertex along the edge line
          (<code>a = 2b</code>, <code>a + b = p − q + t</code>), which yields zero curvature where
          the corner meets the straight edge — the squircle&apos;s signature property.
        </p>
      </DocSection>

      <DocSection id="budget-clamping" kicker="Internals" title="Budget clamping">
        <p>
          When rounding + smoothing don&apos;t fit an edge, the budget is clamped the way Figma
          does it: radius first, then effective smoothing (<code>ξ_eff = p/q − 1</code>).
          Competing corners on a short edge split it proportionally to their demand,
          order-independently, so symmetric shapes stay symmetric.
        </p>
      </DocSection>

      <DocSection id="precision" kicker="Internals" title="Precision">
        <p>
          The <code>precision</code> option controls decimal places in the output path string
          (default <code>2</code>). The parity test suite verifies output against Figma&apos;s own
          exports within <strong>0.01px</strong> across 60°, 90°, and 120° corners, per-corner
          radii, and budget-clamped cases.
        </p>
      </DocSection>
    </>
  );
}
