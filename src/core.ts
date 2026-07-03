/**
 * figma-exact squircle path generator
 *
 * Generates SVG path data for polygons with Figma-style corner rounding
 * and corner smoothing (squircles). The construction was reverse-engineered
 * from ground-truth SVG exports produced by Figma itself and verified to
 * match Figma's output within 0.01px across 60°, 90°, and 120° corners,
 * per-corner radii, and budget-clamped cases.
 *
 * Math summary — per corner with opening angle φ, turn = π − φ,
 * radius R, smoothing ξ (Figma's `cornerSmoothing`, 0–1):
 *
 *   q = R / tan(φ/2)           tangent length of plain rounding
 *   p = (1 + ξ) · q            total edge length consumed
 *   β = (turn / 2) · ξ         heading change per smoothing ramp
 *   t = R · tan(β/2)           tangent length at ramp/arc junction
 *   arc sweep = turn · (1 − ξ) the circular arc shrinks with ξ
 *
 * Smoothing cubic (distances from the vertex along the edge line):
 *   P0 @ p,  P1 @ p − a,  P2 @ q − t   (a = 2b, a + b = p − q + t)
 *   P3 = trimmed-arc endpoint. Mirrored on the outgoing side.
 *
 * Budget clamp (verified against Figma): clamp q to the edge budget
 * first (reducing the radius), then clamp ξ so p fits: ξ_eff = p/q − 1.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface SquirclePoint {
  x: number;
  y: number;
  /** Corner radius in px. Falls back to `defaultRadius`. */
  radius?: number;
  /** Corner smoothing ξ ∈ [0, 1] (Figma's cornerSmoothing). Falls back to `defaultSmoothness`. */
  smoothness?: number;
}

export interface SquircleOptions {
  /** Radius used for points that don't specify their own. Default 0. */
  defaultRadius?: number;
  /** Smoothing used for points that don't specify their own. Default 0. */
  defaultSmoothness?: number;
  /** Decimal places in the output path. Default 2. */
  precision?: number;
}

export interface SquircleRectOptions {
  width: number;
  height: number;
  /** X offset of the rect. Default 0. */
  x?: number;
  /** Y offset of the rect. Default 0. */
  y?: number;
  /** Uniform corner radius. Individual corners override this. */
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomRightRadius?: number;
  bottomLeftRadius?: number;
  /** Figma's cornerSmoothing, ξ ∈ [0, 1]. Default 0. */
  cornerSmoothing?: number;
  /** Decimal places in the output path. Default 2. */
  precision?: number;
}

// ---------------------------------------------------------------------------
// Vector helpers
// ---------------------------------------------------------------------------

interface Vec {
  x: number;
  y: number;
}

const vec = (x: number, y: number): Vec => ({ x, y });
const add = (a: Vec, b: Vec): Vec => vec(a.x + b.x, a.y + b.y);
const sub = (a: Vec, b: Vec): Vec => vec(a.x - b.x, a.y - b.y);
const scale = (v: Vec, s: number): Vec => vec(v.x * s, v.y * s);
const len = (v: Vec): number => Math.hypot(v.x, v.y);
const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y;
const norm = (v: Vec): Vec => {
  const l = len(v);
  return l < 1e-12 ? vec(0, 0) : vec(v.x / l, v.y / l);
};
const rot90ccw = (v: Vec): Vec => vec(-v.y, v.x);

// ---------------------------------------------------------------------------
// Arc → cubic Bézier (standard kappa construction)
// ---------------------------------------------------------------------------

interface Cubic {
  cp1: Vec;
  cp2: Vec;
  end: Vec;
}

function arcToBezier(center: Vec, radius: number, startAngle: number, sweep: number): Cubic[] {
  if (Math.abs(sweep) < 1e-10) return [];

  const maxSweep = Math.PI / 2;
  if (Math.abs(sweep) > maxSweep + 1e-6) {
    const n = Math.ceil(Math.abs(sweep) / maxSweep);
    const seg = sweep / n;
    const out: Cubic[] = [];
    for (let i = 0; i < n; i++) {
      out.push(...arcToBezier(center, radius, startAngle + i * seg, seg));
    }
    return out;
  }

  // kappa carries the sweep's sign: positive for CCW, negative for CW.
  const kappa = (4 / 3) * Math.tan(sweep / 4);

  const cosS = Math.cos(startAngle);
  const sinS = Math.sin(startAngle);
  const cosE = Math.cos(startAngle + sweep);
  const sinE = Math.sin(startAngle + sweep);

  const p0 = add(center, vec(cosS * radius, sinS * radius));
  const p3 = add(center, vec(cosE * radius, sinE * radius));
  const d0 = vec(-sinS, cosS);
  const d3 = vec(-sinE, cosE);

  return [
    {
      cp1: add(p0, scale(d0, kappa * radius)),
      cp2: sub(p3, scale(d3, kappa * radius)),
      end: p3,
    },
  ];
}

// ---------------------------------------------------------------------------
// Corner construction (Figma-exact)
// ---------------------------------------------------------------------------

type Corner =
  | { type: "sharp"; point: Vec }
  | {
      type: "rounded";
      startPoint: Vec;
      endPoint: Vec;
      segments: Cubic[];
    }
  | {
      type: "squircle";
      startPoint: Vec;
      endPoint: Vec;
      inBezier: Cubic;
      arcSegments: Cubic[];
      outBezier: Cubic;
    };

function computeCorner(
  prev: Vec,
  curr: Vec,
  next: Vec,
  radius: number,
  smoothness: number,
  budget: number
): Corner {
  const dirIn = norm(sub(prev, curr));
  const dirOut = norm(sub(next, curr));

  const d = Math.max(-1, Math.min(1, dot(dirIn, dirOut)));
  const phi = Math.acos(d);
  const halfPhi = phi / 2;

  if (halfPhi < 1e-6 || Math.abs(phi - Math.PI) < 1e-6 || radius < 1e-6) {
    return { type: "sharp", point: curr };
  }

  const sinHalf = Math.sin(halfPhi);
  const tanHalf = Math.tan(halfPhi);

  // q = plain-rounding tangent length; clamp radius to budget first
  let q = radius / tanHalf;
  let xi = Math.max(0, Math.min(1, smoothness));

  if (q > budget) {
    q = budget;
    xi = 0;
  } else {
    // then clamp smoothing so p = (1+ξ)q fits the budget
    const p = (1 + xi) * q;
    if (p > budget) xi = budget / q - 1;
  }

  const p = (1 + xi) * q;
  const effectiveRadius = q * tanHalf;

  if (effectiveRadius < 1e-6 || q < 1e-6) {
    return { type: "sharp", point: curr };
  }

  // Inscribed-circle center along the angle bisector
  const bisector = norm(add(dirIn, dirOut));
  const center = add(curr, scale(bisector, effectiveRadius / sinHalf));

  const tangentIn = add(curr, scale(dirIn, q));
  const tangentOut = add(curr, scale(dirOut, q));

  // Arc direction: compare the CCW tangent at tangentIn to the travel direction
  const radialIn = norm(sub(tangentIn, center));
  const isCCW = dot(rot90ccw(radialIn), scale(dirIn, -1)) > 0;

  const startAngle = Math.atan2(radialIn.y, radialIn.x);
  const radialOut = norm(sub(tangentOut, center));
  const endAngle = Math.atan2(radialOut.y, radialOut.x);

  let sweep = endAngle - startAngle;
  if (isCCW) {
    while (sweep < 0) sweep += 2 * Math.PI;
    if (sweep > 2 * Math.PI - 1e-6) sweep -= 2 * Math.PI;
  } else {
    while (sweep > 0) sweep -= 2 * Math.PI;
    if (sweep < -2 * Math.PI + 1e-6) sweep += 2 * Math.PI;
  }

  if (xi < 1e-6) {
    return {
      type: "rounded",
      startPoint: tangentIn,
      endPoint: tangentOut,
      segments: arcToBezier(center, effectiveRadius, startAngle, sweep),
    };
  }

  // --- Figma-exact smoothing parameters ---
  const turn = Math.PI - phi;
  const beta = (turn / 2) * xi;
  const t = effectiveRadius * Math.tan(beta / 2);

  const aPlusB = p - (q - t);
  const b = aPlusB / 3;
  const a = 2 * b;

  // Arc trimmed symmetrically: sweep shrinks by (1 − ξ)
  const reducedSweep = sweep * (1 - xi);
  const midAngle = startAngle + sweep / 2;
  const rStart = midAngle - reducedSweep / 2;
  const rEnd = rStart + reducedSweep;

  const arcSegments =
    Math.abs(reducedSweep) > 1e-6
      ? arcToBezier(center, effectiveRadius, rStart, reducedSweep)
      : [];

  const arcStartPt = add(center, vec(Math.cos(rStart) * effectiveRadius, Math.sin(rStart) * effectiveRadius));
  const arcEndPt = add(center, vec(Math.cos(rEnd) * effectiveRadius, Math.sin(rEnd) * effectiveRadius));

  return {
    type: "squircle",
    startPoint: add(curr, scale(dirIn, p)),
    endPoint: add(curr, scale(dirOut, p)),
    inBezier: {
      cp1: add(curr, scale(dirIn, p - a)),
      cp2: add(curr, scale(dirIn, q - t)),
      end: arcStartPt,
    },
    arcSegments,
    outBezier: {
      cp1: add(curr, scale(dirOut, q - t)),
      cp2: add(curr, scale(dirOut, p - a)),
      end: add(curr, scale(dirOut, p)),
    },
  };
}

// ---------------------------------------------------------------------------
// Budget resolution — order-independent proportional per-edge split
// ---------------------------------------------------------------------------

interface CornerBudget {
  q: number;
  p: number;
}

function resolveBudgets(demands: CornerBudget[], edgeLengths: number[]): number[] {
  const n = demands.length;
  const maxP = demands.map((d) => d.p);
  const allowNext = new Array<number>(n);
  const allowPrev = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const edgeLen = edgeLengths[i];
    const di = maxP[i];
    const dj = maxP[j];
    const total = di + dj;

    if (total > edgeLen && total > 1e-6) {
      allowNext[i] = edgeLen * (di / total);
      allowPrev[j] = edgeLen * (dj / total);
    } else {
      allowNext[i] = di;
      allowPrev[j] = dj;
    }
  }

  const budgets = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    budgets[i] = Math.min(maxP[i], allowNext[i], allowPrev[i]);
  }
  return budgets;
}

// ---------------------------------------------------------------------------
// Path assembly
// ---------------------------------------------------------------------------

function makeFmt(precision: number): (v: number) => number {
  const k = Math.pow(10, precision);
  return (v: number) => Math.round(v * k) / k;
}

/**
 * Generate an SVG path (`d` attribute) for a closed polygon with
 * Figma-style corner rounding + smoothing. Each point may carry its
 * own `radius` and `smoothness`.
 */
export function getSquirclePath(points: SquirclePoint[], options: SquircleOptions = {}): string {
  const { defaultRadius = 0, defaultSmoothness = 0, precision = 2 } = options;
  const n = points.length;
  if (n < 3) return "";

  const fmt = makeFmt(precision);

  const edgeLengths: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edgeLengths.push(len(sub(vec(points[j].x, points[j].y), vec(points[i].x, points[i].y))));
  }

  // Per-corner demand
  const demands: CornerBudget[] = points.map((pt, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const dirIn = norm(sub(vec(prev.x, prev.y), vec(pt.x, pt.y)));
    const dirOut = norm(sub(vec(next.x, next.y), vec(pt.x, pt.y)));
    const d = Math.max(-1, Math.min(1, dot(dirIn, dirOut)));
    const halfPhi = Math.acos(d) / 2;
    const tanHalf = Math.tan(halfPhi);
    const radius = pt.radius ?? defaultRadius;
    const smoothness = Math.max(0, Math.min(1, pt.smoothness ?? defaultSmoothness));
    const q = tanHalf > 1e-9 ? radius / tanHalf : 0;
    return { q, p: (1 + smoothness) * q };
  });

  const budgets = resolveBudgets(demands, edgeLengths);

  const corners: Corner[] = points.map((pt, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    return computeCorner(
      vec(prev.x, prev.y),
      vec(pt.x, pt.y),
      vec(next.x, next.y),
      pt.radius ?? defaultRadius,
      pt.smoothness ?? defaultSmoothness,
      budgets[i]
    );
  });

  let path = "";
  const emitCubic = (c: Cubic) => {
    path += ` C ${fmt(c.cp1.x)} ${fmt(c.cp1.y)} ${fmt(c.cp2.x)} ${fmt(c.cp2.y)} ${fmt(c.end.x)} ${fmt(c.end.y)}`;
  };

  for (let i = 0; i < n; i++) {
    const corner = corners[i];
    const nextCorner = corners[(i + 1) % n];

    if (i === 0) {
      const startPt = corner.type === "sharp" ? corner.point : corner.endPoint;
      path += `M ${fmt(startPt.x)} ${fmt(startPt.y)}`;
    }

    if (nextCorner.type === "sharp") {
      path += ` L ${fmt(nextCorner.point.x)} ${fmt(nextCorner.point.y)}`;
    } else {
      const lineTarget = nextCorner.startPoint;
      const currentEnd = corner.type === "sharp" ? corner.point : corner.endPoint;
      if (Math.abs(lineTarget.y - currentEnd.y) < 10 ** -precision / 2) {
        path += ` H ${fmt(lineTarget.x)}`;
      } else if (Math.abs(lineTarget.x - currentEnd.x) < 10 ** -precision / 2) {
        path += ` V ${fmt(lineTarget.y)}`;
      } else {
        path += ` L ${fmt(lineTarget.x)} ${fmt(lineTarget.y)}`;
      }

      if (nextCorner.type === "rounded") {
        nextCorner.segments.forEach(emitCubic);
      } else {
        emitCubic(nextCorner.inBezier);
        nextCorner.arcSegments.forEach(emitCubic);
        emitCubic(nextCorner.outBezier);
      }
    }
  }

  return path + " Z";
}

/**
 * Non-public helper used by the example site to draw control geometry.
 * It is intentionally not re-exported from `src/index.ts`.
 */
export function getSquircleDebugPath(points: SquirclePoint[], options: SquircleOptions = {}) {
  const { defaultRadius = 0, defaultSmoothness = 0, precision = 2 } = options;
  const n = points.length;
  if (n < 3) return { path: "", corners: [] };

  const edgeLengths: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edgeLengths.push(len(sub(vec(points[j].x, points[j].y), vec(points[i].x, points[i].y))));
  }

  const demands: CornerBudget[] = points.map((pt, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const dirIn = norm(sub(vec(prev.x, prev.y), vec(pt.x, pt.y)));
    const dirOut = norm(sub(vec(next.x, next.y), vec(pt.x, pt.y)));
    const d = Math.max(-1, Math.min(1, dot(dirIn, dirOut)));
    const halfPhi = Math.acos(d) / 2;
    const tanHalf = Math.tan(halfPhi);
    const radius = pt.radius ?? defaultRadius;
    const smoothness = Math.max(0, Math.min(1, pt.smoothness ?? defaultSmoothness));
    const q = tanHalf > 1e-9 ? radius / tanHalf : 0;
    return { q, p: (1 + smoothness) * q };
  });

  const budgets = resolveBudgets(demands, edgeLengths);
  const corners = points.map((pt, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    return computeCorner(
      vec(prev.x, prev.y),
      vec(pt.x, pt.y),
      vec(next.x, next.y),
      pt.radius ?? defaultRadius,
      pt.smoothness ?? defaultSmoothness,
      budgets[i]
    );
  });

  return {
    path: buildPathFromCorners(corners, precision),
    corners,
  };
}

function buildPathFromCorners(corners: Corner[], precision: number): string {
  const n = corners.length;
  const fmt = makeFmt(precision);
  let path = "";
  const emitCubic = (c: Cubic) => {
    path += ` C ${fmt(c.cp1.x)} ${fmt(c.cp1.y)} ${fmt(c.cp2.x)} ${fmt(c.cp2.y)} ${fmt(c.end.x)} ${fmt(c.end.y)}`;
  };

  for (let i = 0; i < n; i++) {
    const corner = corners[i];
    const nextCorner = corners[(i + 1) % n];

    if (i === 0) {
      const startPt = corner.type === "sharp" ? corner.point : corner.endPoint;
      path += `M ${fmt(startPt.x)} ${fmt(startPt.y)}`;
    }

    if (nextCorner.type === "sharp") {
      path += ` L ${fmt(nextCorner.point.x)} ${fmt(nextCorner.point.y)}`;
    } else {
      const lineTarget = nextCorner.startPoint;
      const currentEnd = corner.type === "sharp" ? corner.point : corner.endPoint;
      if (Math.abs(lineTarget.y - currentEnd.y) < 10 ** -precision / 2) {
        path += ` H ${fmt(lineTarget.x)}`;
      } else if (Math.abs(lineTarget.x - currentEnd.x) < 10 ** -precision / 2) {
        path += ` V ${fmt(lineTarget.y)}`;
      } else {
        path += ` L ${fmt(lineTarget.x)} ${fmt(lineTarget.y)}`;
      }

      if (nextCorner.type === "rounded") {
        nextCorner.segments.forEach(emitCubic);
      } else {
        emitCubic(nextCorner.inBezier);
        nextCorner.arcSegments.forEach(emitCubic);
        emitCubic(nextCorner.outBezier);
      }
    }
  }

  return path + " Z";
}

/**
 * Convenience wrapper for rectangles — mirrors Figma's rectangle
 * properties (`cornerRadius`, `cornerSmoothing`, per-corner radii).
 */
export function getSquircleRectPath(options: SquircleRectOptions): string {
  const {
    width,
    height,
    x = 0,
    y = 0,
    cornerRadius = 0,
    cornerSmoothing = 0,
    precision = 2,
  } = options;

  const tl = options.topLeftRadius ?? cornerRadius;
  const tr = options.topRightRadius ?? cornerRadius;
  const br = options.bottomRightRadius ?? cornerRadius;
  const bl = options.bottomLeftRadius ?? cornerRadius;

  return getSquirclePath(
    [
      { x, y, radius: tl },
      { x: x + width, y, radius: tr },
      { x: x + width, y: y + height, radius: br },
      { x, y: y + height, radius: bl },
    ],
    { defaultSmoothness: cornerSmoothing, precision }
  );
}
